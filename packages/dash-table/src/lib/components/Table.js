import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import SheetClip from 'sheetclip';
import Row from './Row.js';
import Header from './Header.js';
import {colIsEditable} from './derivedState';
import {KEY_CODES, isCtrlMetaKey, isMetaKey} from '../utils/unicode';
import computedStyles from './computedStyles';

import 'react-select/dist/react-select.css';
import './Table.css';
import './Dropdown.css';

export default class EditableTable extends Component {
    constructor(props) {
        super(props);

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.collectRows = this.collectRows.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }

    componentDidMount() {
        console.warn('adding event listener');
        document.addEventListener(
            'click',
            this.handleClickOutside.bind(this),
            true
        );
        document.addEventListener('keydown', e => {
            const t0 = performance.now();
            console.debug(`==start`);
            this.handleKeyDown(e);
            const t1 = performance.now();
            console.debug(`==${t1 - t0}ms`);
        });
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener(
            'click',
            this.handleClickOutside.bind(this),
            true
        );
    }

    handleClickOutside(event) {
        const domNode = ReactDOM.findDOMNode(this);

        if (!domNode || !domNode.contains(event.target)) {
            console.warn('handleClickOutside');
            this.props.setProps({
                selected_cell: [[]],
                is_focused: false,
            });
        }
    }

    handleKeyDown(e) {
        const {columns, end_cell, setProps, is_focused, editable} = this.props;

        console.warn(`handleKeyDown: ${e.key}`);

        // catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
        const ctrlDown = (e.ctrlKey || e.metaKey) && !e.altKey;

        // if this is the initial CtrlMeta keydown with no modifiers then pass
        if (isCtrlMetaKey(e.keyCode)) {
            return;
        }

        // if paste event onPaste handler registered in Table jsx handles it
        if (ctrlDown && e.keyCode === KEY_CODES.V) {
            return;
        }

        // copy
        if (e.keyCode === KEY_CODES.C && ctrlDown && !is_focused) {
            this.onCopy(e);
            return;
        }

        if (e.keyCode === KEY_CODES.ESCAPE) {
            setProps({is_focused: false});
            return;
        }

        if (e.keyCode === KEY_CODES.ENTER) {
            if (is_focused) {
                this.switchCell(e, 'down');
            } else {
                if (colIsEditable(editable, columns[end_cell[1]])) {
                    setProps({is_focused: true});
                }
            }
            return;
        }

        if (is_focused && e.keyCode !== KEY_CODES.TAB) {
            return;
        }

        if (e.keyCode === KEY_CODES.ARROW_LEFT) {
            this.switchCell(e, 'left');
        } else if (e.keyCode === KEY_CODES.ARROW_UP) {
            this.switchCell(e, 'up');
        } else if (
            e.keyCode === KEY_CODES.ARROW_RIGHT ||
            e.keyCode === KEY_CODES.TAB
        ) {
            this.switchCell(e, 'right');
        } else if (e.keyCode === KEY_CODES.ARROW_DOWN) {
            this.switchCell(e, 'down');
        } else if (
            e.keyCode === KEY_CODES.BACKSPACE ||
            e.keyCode === KEY_CODES.DELETE
        ) {
            this.deleteCell(e);
        }
        // if we have any non-meta key enter editable mode
        else if (
            !this.props.is_focused &&
            colIsEditable(editable, columns[end_cell[1]]) &&
            !isMetaKey(e.keyCode)
        ) {
            setProps({is_focused: true});
        }

        return;
    }

    switchCell(event, direction) {
        const e = event;
        const {columns, dataframe, selected_cell, setProps} = this.props;

        // visible col indices
        const vci = [];
        columns.forEach((c, i) => {
            if (!c.hidden) {
                vci.push(i);
            }
        });

        const nextCell = this.getNextCell(vci, direction);

        if (!e.shiftKey) {
            setProps({
                is_focused: false,
                start_cell: nextCell,
                end_cell: nextCell,
                selected_cell: [nextCell],
            });
            return;
        }

        /*
         * the active element might be a rogue, unfocused input:
         * blur it so that it doesn't display a selection while
         * selecting multiple cells
         */
        document.activeElement.blur();
        let targetCells;
        let removeCells = null;

        const sortNumerical = R.sort((a, b) => a - b);
        const selectedRows = sortNumerical(R.uniq(R.pluck(0, selected_cell)));
        const selectedCols = sortNumerical(R.uniq(R.pluck(1, selected_cell)));

        if (
            e.keyCode === KEY_CODES.ARROW_UP ||
            e.keyCode === KEY_CODES.ARROW_DOWN
        ) {
            targetCells = selectedCols.map(col => [nextCell[0], col]);
            if (
                R.intersection(targetCells, selected_cell).length &&
                nextCell[0] !== 0 &&
                nextCell[0] !== dataframe.length - 1
            ) {
                if (e.keyCode === KEY_CODES.ARROW_DOWN) {
                    removeCells = targetCells.map(c => [c[0] - 1, c[1]]);
                } else if (e.keyCode === KEY_CODES.ARROW_UP) {
                    removeCells = targetCells.map(c => [c[0] + 1, c[1]]);
                }
            }
        } else if (
            e.keyCode === KEY_CODES.ARROW_LEFT ||
            e.keyCode === KEY_CODES.ARROW_RIGHT
        ) {
            targetCells = selectedRows.map(row => [row, nextCell[1]]);
            if (
                R.intersection(targetCells, selected_cell).length &&
                nextCell[1] !== vci[0] &&
                nextCell[1] !== R.last(vci)
            ) {
                if (e.keyCode === KEY_CODES.ARROW_LEFT) {
                    removeCells = targetCells.map(c => [c[0], c[1] + 1]);
                } else if (e.keyCode === KEY_CODES.ARROW_RIGHT) {
                    removeCells = targetCells.map(c => [c[0], c[1] - 1]);
                }
            }
        } else {
            targetCells = [nextCell];
        }

        let newSelectedCell = R.concat(targetCells, selected_cell);
        if (removeCells) {
            newSelectedCell = R.without(removeCells, newSelectedCell);
        }

        setProps({
            is_focused: false,
            end_cell: nextCell,
            selected_cell: R.uniq(newSelectedCell),
        });
    }

    deleteCell(event) {
        const {
            columns,
            dataframe,
            editable,
            selected_cell,
            setProps,
        } = this.props;

        event.preventDefault();

        let newDataframe = dataframe;
        selected_cell.forEach(cell => {
            if (colIsEditable(editable, columns[cell[1]])) {
                newDataframe = R.set(
                    R.lensPath([cell[0], columns[cell[1]].id]),
                    '',
                    newDataframe
                );
            }
        });

        setProps({
            dataframe: newDataframe,
        });
    }

    getNextCell(vci, direction) {
        const {dataframe, end_cell} = this.props;
        switch (direction) {
            case 'left':
                return [
                    end_cell[0],
                    R.max(vci[0], vci[R.indexOf(end_cell[1], vci) - 1]),
                ];
            case 'right':
                return [
                    end_cell[0],
                    R.min(R.last(vci), vci[R.indexOf(end_cell[1], vci) + 1]),
                ];
            case 'up':
                return [R.max(0, end_cell[0] - 1), end_cell[1]];
            case 'down':
                return [
                    R.min(dataframe.length - 1, end_cell[0] + 1),
                    end_cell[1],
                ];
            default:
                throw new Error(
                    `Table.getNextCell: unknown direction ${direction}`
                );
        }
    }

    onCopy(e) {
        const {columns, dataframe, selected_cell} = this.props;

        e.preventDefault();
        const el = document.createElement('textarea');
        const selectedRows = R.uniq(R.pluck(0, selected_cell).sort());
        const selectedCols = R.uniq(R.pluck(1, selected_cell).sort());
        const selectedTabularData = R.slice(
            R.head(selectedRows),
            R.last(selectedRows) + 1,
            dataframe
        ).map(row =>
            R.props(selectedCols, R.props(R.pluck('id', columns), row))
        );

        el.value = selectedTabularData
            .map(row => R.values(row).join('\t'))
            .join('\r\n');

        // (Adapted from https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f)
        // Make it readonly to be tamper-proof
        el.setAttribute('readonly', '');
        // el.style.position = 'absolute';
        // Move outside the screen to make it invisible
        // el.style.left = '-9999px';
        // Append the <textarea> element to the HTML document
        document.body.appendChild(el);

        // Check if there is any content selected previously
        let selected = false;
        if (document.getSelection().rangeCount > 0) {
            // Store selection if found
            selected = document.getSelection().getRangeAt(0);
        }

        // Select the <textarea> content
        el.select();
        // Copy - only works as a result of a user action (e.g. click events)
        document.execCommand('copy');
        // Remove the <textarea> element
        document.body.removeChild(el);
        // If a selection existed before copying
        if (selected) {
            // Unselect everything on the HTML document
            document.getSelection().removeAllRanges();
            // Restore the original selection
            document.getSelection().addRange(selected);
        }
        // refocus on the table so that onPaste can be fired immediately
        // on the same table
        // note that this requires tabIndex to be set on the <table/>
        this._table.focus();
        return;
    }

    onPaste(e) {
        const {
            columns,
            dataframe,
            editable,
            setProps,
            end_cell,
            is_focused,
        } = this.props;

        if (e && e.clipboardData && !is_focused) {
            const text = e.clipboardData.getData('text/plain');
            if (text) {
                const values = SheetClip.prototype.parse(text);

                let newDataframe = dataframe;
                const newColumns = columns;

                if (values[0].length + end_cell[1] >= columns.length) {
                    for (
                        let i = columns.length;
                        i < values[0].length + end_cell[1];
                        i++
                    ) {
                        newColumns.push({
                            name: `Column ${i + 1}`,
                            type: 'numeric',
                        });
                        newDataframe.forEach(row => (row[`Column ${i}`] = ''));
                    }
                }

                if (values.length + end_cell[0] >= dataframe.length) {
                    const emptyRow = {};
                    columns.forEach(c => (emptyRow[c.name] = ''));
                    newDataframe = R.concat(
                        newDataframe,
                        R.repeat(
                            emptyRow,
                            values.length + end_cell[0] - dataframe.length
                        )
                    );
                }

                values.forEach((row, i) =>
                    row.forEach((cell, j) => {
                        const iOffset = end_cell[0] + i;
                        const jOffset = end_cell[1] + j;
                        // let newDataframe = dataframe;
                        const col = newColumns[jOffset];
                        if (colIsEditable(editable, col)) {
                            newDataframe = R.set(
                                R.lensPath([iOffset, col.id]),
                                cell,
                                newDataframe
                            );
                        }
                    })
                );
                setProps({
                    dataframe: newDataframe,
                    columns: newColumns,
                });
            }
        }
    }

    collectRows(slicedDf, start) {
        const {collapsable, columns, expanded_rows} = this.props;
        const rows = [];
        for (let i = 0; i < slicedDf.length; i++) {
            const row = slicedDf[i];
            rows.push(
                <Row
                    key={start + i}
                    row={row}
                    idx={start + i}
                    {...this.props}
                />
            );
            if (collapsable && R.contains(start + i, expanded_rows)) {
                rows.push(
                    <tr>
                        <td className="expanded-row--empty-cell" />
                        <td colSpan={columns.length} className="expanded-row">
                            <h1>{`More About Row ${start + i}`}</h1>
                        </td>
                    </tr>
                );
            }
        }
        return rows;
    }

    render() {
        const {
            collapsable,
            columns,
            dataframe,
            display_row_count: n,
            display_tail_count: m,
            table_style,
            n_fixed_columns,
            n_fixed_rows,
        } = this.props;

        const table_component = (
            <table
                ref={el => (this._table = el)}
                onPaste={this.onPaste}
                tabIndex={-1}
                style={table_style}
            >
                <Header {...this.props} />

                <tbody>
                    {this.collectRows(dataframe.slice(0, n), 0)}

                    {dataframe.length < n + m ? null : (
                        <tr>
                            {!collapsable ? null : (
                                <td className="expanded-row--empty-cell" />
                            )}
                            <td className="elip" colSpan={columns.length}>
                                {'...'}
                            </td>
                        </tr>
                    )}

                    {dataframe.length < n
                        ? null
                        : this.collectRows(
                              dataframe.slice(
                                  R.max(dataframe.length - m, n),
                                  dataframe.length
                              ),
                              R.max(dataframe.length - m, n)
                          )}
                </tbody>
            </table>
        );

        if (n_fixed_columns || n_fixed_rows) {
            return (
                <div
                    className="dash-spreadsheet"
                    style={computedStyles.scroll.containerDiv(this.props)}
                >
                    {table_component}
                </div>
            );
        }
        return <div className="dash-spreadsheet">{table_component}</div>;
    }
}

EditableTable.defaultProps = {
    changed_data: {},
    editable: false,
    index_name: '',
    types: {},
    merged_styles: {},
    base_styles: {
        numeric: {
            'text-align': 'right',
            'font-family': "'Droid Sans Mono', Courier, monospace",
        },

        string: {
            'text-align': 'left',
        },

        input: {
            padding: 0,
            margin: 0,
            width: '80px',
            border: 'none',
            'font-size': '1rem',
        },

        'input-active': {
            outline: '#7FDBFF auto 3px',
        },

        table: {},

        thead: {},

        th: {},

        td: {},
    },
};

EditableTable.propTypes = {
    collapsable: PropTypes.any,
    columns: PropTypes.any,
    dataframe: PropTypes.any,
    display_row_count: PropTypes.any,
    display_tail_count: PropTypes.any,
    editable: PropTypes.any,
    end_cell: PropTypes.any,
    expanded_rows: PropTypes.any,
    is_focused: PropTypes.any,
    n_fixed_columns: PropTypes.any,
    n_fixed_rows: PropTypes.any,
    selected_cell: PropTypes.any,
    setProps: PropTypes.any,
    start_cell: PropTypes.any,
    table_style: PropTypes.any,
};
