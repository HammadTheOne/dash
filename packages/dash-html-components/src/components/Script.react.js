
import React, {PropTypes} from 'react';

const Script = (props) => (
    <script {...props}>
        {props.children}
    </script>
);

Script.propTypes = {

    /**
     * Indicates that the script should be executed asynchronously.
     */
    'async': PropTypes.string,

    /**
     * Declares the character encoding of the page or script.
     */
    'charSet': PropTypes.string,

    /**
     * Indicates that the script should be executed after the page has been parsed.
     */
    'defer': PropTypes.string,

    /**
     * Security Feature that allows browsers to verify what they fetch.     MDN Link
     */
    'integrity': PropTypes.string,

    /**
     * The URL of the embeddable content.
     */
    'src': PropTypes.string,

    /**
     * Defines the type of the element.
     */
    'type': PropTypes.string,

    /**
     * Defines a keyboard shortcut to activate or add focus to the element.
     */
    'accessKey': PropTypes.string,

    /**
     * Often used with CSS to style elements with common properties.
     */
    'className': PropTypes.string,

    /**
     * Indicates whether the element's content is editable.
     */
    'contentEditable': PropTypes.string,

    /**
     * Defines the ID of a <menu> element which will serve as the element's context menu.
     */
    'contextMenu': PropTypes.string,

    /**
     * Defines the text direction. Allowed values are ltr (Left-To-Right) or rtl (Right-To-Left)
     */
    'dir': PropTypes.string,

    /**
     * Defines whether the element can be dragged.
     */
    'draggable': PropTypes.string,

    /**
     * Prevents rendering of given element, while keeping child elements, e.g. script elements, active.
     */
    'hidden': PropTypes.string,

    /**
     * Often used with CSS to style a specific element. The value of this attribute must be unique.
     */
    'id': PropTypes.string,

    /**
     * Defines the language used in the element.
     */
    'lang': PropTypes.string,

    /**
     * Indicates whether spell checking is allowed for the element.
     */
    'spellCheck': PropTypes.string,

    /**
     * Defines CSS styles which will override styles previously set.
     */
    'style': PropTypes.object,

    /**
     * Overrides the browser's default tab order and follows the one specified instead.
     */
    'tabIndex': PropTypes.string,

    /**
     * Text to be displayed in a tooltip when hovering over the element.
     */
    'title': PropTypes.string
};

export default Script;