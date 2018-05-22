(function (window, document, $, undefined) {
    function getMergedOptions(options) {
        // merge
        return $.extend({}, defaults, options);
    };

    var defaults = {
        modalId: 'mdlShowRemote',
        formId: 'frmShowRemote',
        url: '',
        enctype: 'application/x-www-form-urlencoded',
        templateValues: {
            title: 'Modal Title',
            submit: 'Submit',
            close: 'Close'
        },
        btnSubmit: '#mdlShowRemote_btnSubmit',
        btnClose: '#mdlShowRemote_btnClose',

        template:
            '<form id="{{formId}}">' +
            '  <div class="modal" tabindex="-1" role="dialog" id="{{modalId}}">' +
		    '    <div class="modal-dialog" role="document">' +
		    '      <div class="modal-content">' +
		    '        <div class="modal-header">' +
		    '          <h5 class="modal-title">{{templateValues.title}}</h5>' +
		    '          <button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
		    '            <span aria-hidden="true">×</span>' +
		    '          </button>' +
		    '        </div>' +
		    '        <div class="modal-body">' +
		    '  			<div class="loading-indicator">' +
		    '  				<div class="loading-bar"></div>' +
		    '  				<div class="loading-bar"></div>' +
		    '  				<div class="loading-bar"></div>' +
		    '  				<div class="loading-bar"></div>' +
		    '  			</div>' +
		    '        </div>' +
		    '        <div class="modal-footer">' +
		    '          <button type="button" id="{{modalId}}_btnClose" class="btn btn-secondary" data-dismiss="modal">{{templateValues.close}}</button>' +
		    '          <button type="submit" id="{{modalId}}_btnSubmit" class="btn btn-primary">{{templateValues.submit}}</button>' +
		    '        </div>' +
		    '      </div>' +
		    '    </div>' +
		    '  </div>' +
            '</form>',
        serializeFields: function (modal) {
            var toReturn = [];
            var els = modal.find(':input').get();

            $.each(els, function () {
                if (this.name && !this.disabled && (this.checked || /select|textarea/i.test(this.nodeName) || /text|hidden|password/i.test(this.type))) {
                    var val = $(this).val();
                    toReturn.push(encodeURIComponent(this.name) + "=" + encodeURIComponent(val));
                }
            });

            return toReturn.join("&").replace(/%20/g, "+");
        }
    };

    $.fn.showRemoteForm = function (options) {
        // attach to click event of decorated elements.
        this.on('click', function (e) {
            e.preventDefault();
            // re-render the template each time
            var $target = $(e.target);

            var mergedOptions = getMergedOptions(options);

            mergedOptions.url = $.isFunction(mergedOptions.url) ? mergedOptions.url($target) : mergedOptions.url;

            var compiledTemplate = Handlebars.compile(mergedOptions.template);
            $('body').append(compiledTemplate(mergedOptions));

            var modalId = '#' + mergedOptions.modalId;
            var formId = '#' + mergedOptions.formId;

            var modal = $(modalId).modal('show');

            modal.on('hidden.bs.modal', function (e) {
                $(formId).remove();
            });

            if (mergedOptions.onModalShown !== undefined) {
                mergedOptions.onModalShown(e, modal, mergedOptions);
            }

            // load the form using an AJAX request.
            $.ajax({
                url: mergedOptions.url,
                cache: false,
                type: "GET",
                dataType: "html",
                success: function (data, status, xhr) {
                    // show the response in the modal.
                    $(modalId).find('.modal-body').html(data);

                    // wire up events
                    $(modalId).find(mergedOptions.btnClose).on('click', function (e) {
                        if (mergedOptions.onFormClosed !== undefined) {
                            e.preventDefault();
                            mergedOptions.onFormClosed(e, modal, mergedOptions);

                            // close manually.
                            $(modalId).modal('hide')
                        }
                    });

                    $(modalId).find(mergedOptions.btnSubmit).on('click', function (e) {
                        if (mergedOptions.onFormSubmitted !== undefined) {
                            e.preventDefault();
                            mergedOptions.onFormSubmitted(e, modal, mergedOptions, mergedOptions.serializeFields(modal));

                            // close manually.
                            $(modalId).modal('hide')
                        }
                    });

                    if (mergedOptions.onFormShown !== undefined) {
                        mergedOptions.onFormShown(e, modal, mergedOptions);
                    }
                },
                error: function (xhr, status, error) {
                    $(modalId).find('.modal-body').html('<p>Error!!!</p>');
                },
                complete: function (xhr, status) {

                }
            });
        });

        return this;
    }
})(window, document, jQuery);