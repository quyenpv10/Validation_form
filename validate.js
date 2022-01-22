// Object
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    // ham thuc hien validate
    var selectorRules = {};

    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        //Lay ra cac rule cua selector
        var rules = selectorRules[rule.selector];

        //lap qua tung rule 
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);
    if (formElement) {

        //Lap qua moi rule va xu li(lang nghe)
        formElement.onsubmit = (e) => {
            e.preventDefault();

            var isFormValid = true;

            //thuc hien lap qua tung rule va validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });
            if (isFormValid) {


                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        (values[input.name] = input.value)
                        return values;

                    }, {})
                    options.onSubmit({
                        formValues
                    })

                } else {
                    formElement.submit();
                }

            }
        }

        options.rules.forEach((rule) => {

            // luu lai cac rule trong moi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                // xu li turong hợp blur khỏi input
                inputElement.onblur = function() {
                        validate(inputElement, rule);
                    }
                    //Xử lí mỗi khi người dùng nhập input
                inputElement.oninput = () => {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            }
        });
    }
}

// Dinh nghia cac rule
// Nguyen tac cua cac rule
// khi co loi tra ra message loi
// khi hop le thi ko tra ra gi undefined
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';

        }
    };
}

Validator.minLength = (selector, min, message) => {
    return {
        selector: selector,
        test: function(value) {
            return value.length >= 6 ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`

        }
    };
}

Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value == getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }

}