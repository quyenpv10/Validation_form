function Validator(formSelector, options) {
    if (!options) {
        options = {};
    }


    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }


    }
    var formRules = {};
    var validatorRules = {

        /**
         * Quy ước các rule:
         * -- Nếu có lỗi thì return `error message`
         * nếu không có lỗi thi return `undefined`
         */
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email';
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} kí tự`
            }
        }
    };


    // lay ra form element co trong dom
    var formElement = document.querySelector(formSelector);
    // chi xu li khi co element trong dom
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');

            for (var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                    // console.log(validatorRules[rule](ruleInfo[1]))
                }

                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }
            // Lắng nghe sự kiện
            input.onblur = handleValidate;
            input.oninput = handleClearError;


        }

        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;
            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) break;
            }

            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var errorElement = formGroup.querySelector('.form-message');
                    if (errorElement) {
                        errorElement.innerText = errorMessage
                    }
                }
            }
            return !errorMessage;
        }


        // ham clear message loi
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
                var errorElement = formGroup.querySelector('.form-message');
                if (errorElement) {
                    errorElement.innerText = '';
                }
            }
        }

    }

    // xu li submit
    formElement.onsubmit = function(e) {
        e.preventDefault();
        var isValid = true;
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            if (!handleValidate({
                    target: input
                })) {
                isValid = false;
            }
        }
        if (isValid) {
            if (typeof options.onSubmit === 'function') {
                options.onSubmit();
            } else {
                formElement.submit()
            }
        }


    }

}