jQuery(function ($) {
    var input = document.getElementById('calc_input');
    var output = document.getElementById('calc_output');
    var dataCalculated = false;
    var $calc = $('#calc');
    var SKIP_CLICK_TOMEOUT = 100;

    function calculate(){
        try{
            var result = eval(input.value);
            if(result == undefined) result = '';
            output.value = result;
            dataCalculated = true;
        }
        catch(e){
            clear();
            return;
        }
    }
    function insertData($btn){
        input.value += $btn.data('val');
    }
    function insertOperator($btn) {
        if(dataCalculated){
            input.value = output.value;
            output.value = '';
        }
        insertData($btn);
    }
    function clear() {
        input.value = '';
        output.value = '';
        dataCalculated = false;
    }
    function stepBack() {
        if(input.value.length == 0) return;
        input.value = input.value.substr(0, input.value.length - 1);
        dataCalculated = false;
    }

    function calcBtnOnClick() {
        var $this = $(this);
        $this.blur();
        if(this.__SKIP_CLICK) return;
        protectFromDoubleClick(this);
        var action = $this.data('action');
        switch (action){
            case 'insert-data':
                insertData($this);
                break;
            case 'insert-operator':
                insertOperator($this);
                break;
            case 'calculate':
                calculate();
                break;
            case 'clear':
                clear();
                break;
            case 'step-back':
                stepBack();
                break;

        }
    }

    $calc.find('button').click(calcBtnOnClick);

    function protectFromDoubleClick(btn){
        btn.__SKIP_CLICK = true;
        setTimeout(function(){
            btn.__SKIP_CLICK = false;
        }, SKIP_CLICK_TOMEOUT);
    }
});
