/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <jevin9@gmail.com> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return. Jevin O. Sewaruth
 * ----------------------------------------------------------------------------
 *
 * Autogrow Textarea Plugin Version v3.0
 * http://www.technoreply.com/autogrow-textarea-plugin-3-0
 * 
 * THIS PLUGIN IS DELIVERD ON A PAY WHAT YOU WHANT BASIS. IF THE PLUGIN WAS USEFUL TO YOU, PLEASE CONSIDER BUYING THE PLUGIN HERE :
 * https://sites.fastspring.com/technoreply/instant/autogrowtextareaplugin
 *
 * Date: October 15, 2012
 */

/*
 * Original: https://github.com/jevin/Autogrow-Textarea
 *
 * NB: Local changes to handle width and preserve font-weight.
 */

jQuery.fn.autoGrow = function(options) {
  if (!options) options = {};
  console.log(options);
  return this.each(function() {

    var createMirror = function(textarea) {
      jQuery(textarea).after('<div class="autogrow-textarea-mirror"></div>');
      return jQuery(textarea).next('.autogrow-textarea-mirror')[0];
    }

    var sendContentToMirror = function (textarea) {
      mirror.innerHTML = String(textarea.value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/ /g, '&nbsp;')
        .replace(/\n/g, '<br />') +
        '.'
      ;
      var w = jQuery(mirror).width() + 15;
      if (jQuery(textarea).width() != w &&
          (!options.maxWidth || w < options.maxWidth)) {
        jQuery(textarea).width(w);
      }
      var h = jQuery(mirror).height();
      if (jQuery(textarea).height() != h &&
          (!options.maxHeight || h < options.maxHeight)) {
        jQuery(textarea).height(h);
      }
    }

    var growTextarea = function () {
      sendContentToMirror(this);
    }

    // Create a mirror
    var mirror = createMirror(this);

    // Style the mirror
/* For debugging, enable this and set display to != none.
    mirror.style.position = 'absolute';
    mirror.style.left = '0';
    mirror.style.top = '0';
    mirror.style.border = 'solid 1px'; */
    mirror.style.display = 'none';
    mirror.style.wordWrap = 'break-word';
    mirror.style.whiteSpace = 'normal';
    mirror.style.padding = jQuery(this).css('padding');
    mirror.style.fontFamily = jQuery(this).css('font-family');
    mirror.style.fontWeight = jQuery(this).css('font-weight');
    mirror.style.fontSize = jQuery(this).css('font-size');
    mirror.style.lineHeight = jQuery(this).css('line-height');

    // Style the textarea
    this.style.overflow = "hidden";
    this.style.minHeight = this.rows+"em";

    // Bind the textarea's event
    this.onkeyup = growTextarea;

    // Fire the event for text already present
    sendContentToMirror(this);

  });
};
