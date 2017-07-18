Array.prototype.findById = function (id) {
    for(var i = 0; i < this.length; i++){
        if(this[i].id == id){
            return this[i];
        }
    }
};

Array.prototype.findIndexById = function (id) {
    for(var i = 0; i < this.length; i++){
        if(this[i].id == id){
            return i;
        }
    }
};

function myParseInt(value){
    value = parseInt(value);
    if(isNaN(value)){value = 0;}
    return value;
}

function getCounter() {
    var counter = 0;
    return function () {
        return counter++;
    }
}


jQuery(function ($) {
    if(!localStorage){
        alert('У Вас устаревший браузер!\nОдно неверное движение и данные будут потеряны!');
    }

    var debtInput = document.getElementById('debt');

    var $popUpBg = $('#pop-up-bg');
    var $realEstateWindow = $('#real-estate-window');

    var $getSalaryBtn = $('#get-salary'),
        getSalaryBtnClicked = false;

    var $businessWindow = $('#business-window');
    var $businessItemTemplate = $($('#business-item-template').html());
    var $realEstateItemTemplate = $($('#real-estate-item-template').html());
    var $landWindow = $('#land-window');

    var $realEstateTableBody = $('.income .real-estate table tbody');
    var $smallBusinessTableBody = $('.income .small-business table tbody');
    var $bigBusinessTableBody = $('.income .big-business table tbody');

    var $spendingBlock = $('.spending');
    var balance = {
        activeIncome :0,
        passiveIncome: 0,
        totalIncome: 0,
        totalSpending: 0,
        balance: 0,
        isWorkless: false
    };

    var getID = getCounter();

    var businessList = [];
    var realEstate = [];
    function calculateSpending(){
        balance.totalSpending = 0;
        // суммируем все поля обычных расходов кроме детей
        $spendingBlock.find('input:not(.no-index)').each(function () {
            balance.totalSpending += myParseInt(this.value);
        });
        // отдельно добавляем детей
        var childrenCount = myParseInt($spendingBlock.find('input.children-count').val());
        var childrenPrice = myParseInt($spendingBlock.find('input.children-price').val());
        balance.totalSpending += childrenCount*childrenPrice;
        // кредиты
        realEstate.forEach(function (estate) {
            balance.totalSpending += estate.creditPercent;
        });
        calculateBalance();
    }

    function calculatePassiveIncome() {
        balance.passiveIncome = 0;
        businessList.forEach(function (business) {
            balance.passiveIncome += business.value;
        });

        realEstate.forEach(function (estate) {
            balance.passiveIncome += estate.rent;
        });
        calculateBalance();
    }

    function calculateBalance(){
        balance.activeIncome = myParseInt(document.getElementById('salary').value);
        if(balance.isWorkless){
            balance.activeIncome = 0;
        }
        balance.totalIncome = balance.activeIncome + balance.passiveIncome;
        balance.balance = balance.totalIncome - balance.totalSpending;
        drawBalance();
    }

    $('#salary').on('input', calculateBalance);

    function drawBalance() {
        document.getElementById('balance-active-income').value = balance.activeIncome;
        document.getElementById('balance-passive-income').value = balance.passiveIncome;
        document.getElementById('balance-total-income').value = balance.totalIncome;
        document.getElementById('balance-total-spending').value = balance.totalSpending;
        document.getElementById('balance-balance').value = balance.balance;
    }

    function calculateStartCredit(creditPercentInputId, creditBodyInputId) {
        var creditPercent = myParseInt(document.getElementById(creditPercentInputId).value);
        var creditBody = myParseInt(document.getElementById(creditBodyInputId).value);
        if(creditPercent > 0 && creditBody > 0){
            creditBody -= creditPercent;
            if(creditBody <= 0){
                creditBody = 0;
                creditPercent = 0;
                document.getElementById(creditPercentInputId).value = creditPercent;
            }
            document.getElementById(creditBodyInputId).value = creditBody;
        }
        if(creditPercent > 0 && creditBody == 0){
            document.getElementById(creditPercentInputId).value = 0;
        }
    }


    $getSalaryBtn.click(function () {
        if(!getSalaryBtnClicked){
            $getSalaryBtn.blur();
            getSalaryBtnClicked = true;
            $getSalaryBtn.addClass('btn-success');
            setTimeout(function () {
                getSalaryBtnClicked = false;
                $getSalaryBtn.removeClass('btn-success');
            }, 5000);

            calculateStartCredit('start-credit-percent-car', 'start-credit-body-car');
            calculateStartCredit('start-credit-percent-apartment', 'start-credit-body-apartment');
            realEstate.forEach(function (estate) {
                if(estate.creditBody > 0){
                    estate.creditBody -= estate.creditPercent;
                    if(estate.creditBody <= 0){
                        estate.creditBody = 0;
                        estate.creditPercent = 0;
                    }
                }
            });
            drawRealEstateList();
            /*if(balance.balance < 0){
                var debt = myParseInt(debtInput.value);
                debt += Math.abs(balance.balance);
                debtInput.value = debt;
            }*/
        }
    });

    function debtChange(message, action) {
        var debtChangeValue = myParseInt(prompt(message, ''));
        var debt = myParseInt(debtInput.value);
        switch (action){
            case 'increase':
                debt += debtChangeValue;
                break;
            case 'decrease':
                debt -= debtChangeValue;
                break;
            default:
                break;
        }
        debtInput.value = debt;
    }
    document.getElementById('debt-increase').addEventListener('click', function () {
        debtChange('Сколько Вы хотите взять в долг?', 'increase');
    });
    document.getElementById('debt-decrease').addEventListener('click', function () {
        debtChange('Сколько Вы хотите выплотить?', 'decrease');
    });

    function _drawBusinessList(type) {
        var $table;
        if(type == 'small'){
            $table = $smallBusinessTableBody;
        }else{
            $table = $bigBusinessTableBody;
        }
        $table.empty();
        businessList.forEach(function (business) {
            if(business.type == type) {
                var $newBusiness = $businessItemTemplate.clone();
                $newBusiness.attr('data-id', business.id);
                $newBusiness.find('.name').text(business.name);
                $newBusiness.find('.value').text(business.value);
                $table.append($newBusiness);
            }
        });
    }

    function drawRealEstateList() {
        $realEstateTableBody.empty();
        realEstate.forEach(function (estate) {
            var $newRealEstate = $realEstateItemTemplate.clone();
            $newRealEstate.attr('data-id', estate.id);
            $newRealEstate.find('.name').text(estate.name);
            $newRealEstate.find('.rent').text(estate.rent);
            $newRealEstate.find('.credit-body').text(estate.creditBody);
            $newRealEstate.find('.credit-percent').text(estate.creditPercent);
            $realEstateTableBody.append($newRealEstate);
        });
    }

    function _addRealEstate() {
        var name = $realEstateWindow.find('.name').val(),
            rent = myParseInt($realEstateWindow.find('.rent').val()),
            creditBody = myParseInt($realEstateWindow.find('.credit-body').val()),
            creditPercent = myParseInt($realEstateWindow.find('.credit-percent').val());

        if(name == '') return;

        realEstate.push({
            id: getID(),
            name: name,
            rent: rent,
            creditBody: creditBody,
            creditPercent: creditPercent
        });

        drawRealEstateList();
        calculatePassiveIncome();
        calculateSpending();
        $realEstateWindow.find('.close-btn').click();
    }
    function _editRealEstate() {
        var currentRealEstateId = $realEstateWindow.attr('data-id');
        var currentRealEstate = realEstate.findById(currentRealEstateId);
        if(currentRealEstate){
            currentRealEstate.name = $realEstateWindow.find('.name').val();
            currentRealEstate.rent = myParseInt($realEstateWindow.find('.rent').val());
            currentRealEstate.creditBody = myParseInt($realEstateWindow.find('.credit-body').val());
            currentRealEstate.creditPercent = myParseInt($realEstateWindow.find('.credit-percent').val());
        }
        drawRealEstateList();
        calculatePassiveIncome();
        calculateSpending();
        $realEstateWindow.find('.close-btn').click();
    }

    //добавить недвижимость
    $realEstateWindow.find('.add-btn').click(function () {
        var action = $realEstateWindow.attr('data-action');
        switch (action){
            case 'add':
                _addRealEstate();
                break;
            case 'edit':
                _editRealEstate();
                break;
        }
    });

    //продать недвижимость
    $(document).on('click', '.sell-estate', function () {
        if(!confirm('Вы уверены что хотите продать недвижимость?')) return;
        var id = $(this).closest('.passive-income-item').attr('data-id');
        var currentEstateIndex = realEstate.findIndexById(id);
        var currentEstateCreditBody = realEstate[currentEstateIndex].creditBody;
        if(currentEstateCreditBody > 0){
            alert('Верните в банк $' + currentEstateCreditBody);
        }
        realEstate.splice(currentEstateIndex, 1);
        drawRealEstateList();
        calculatePassiveIncome();
        calculateSpending();
    });

    function _showRealEstateWindow(action, header, currentRealEstate){
        $popUpBg.addClass('active');

        $realEstateWindow.attr('data-action', action);
        $realEstateWindow.find('.header').text(header);

        if(currentRealEstate){
            $realEstateWindow.attr('data-id', currentRealEstate.id);
            $realEstateWindow.find('input.name').val(currentRealEstate.name);
            $realEstateWindow.find('input.rent').val(currentRealEstate.rent);
            $realEstateWindow.find('input.credit-body').val(currentRealEstate.creditBody);
            $realEstateWindow.find('input.credit-percent').val(currentRealEstate.creditPercent);
        }else{
            $realEstateWindow.find('input').val('');
        }
        $realEstateWindow.addClass('active').find('input.name').focus();
    }

    $('#add-real-estate-btn').click(function () {
        _showRealEstateWindow('add', 'Добавление недвижимости');
    });

    $(document).on('click', '.edit-estate', function () {
        var id = $(this).closest('.passive-income-item').attr('data-id');
        var currentRealEstate = realEstate.findById(id);
        _showRealEstateWindow('edit', 'Изменить недвижимость', currentRealEstate);
    });

    function _addBusiness() {
        var businessType = $businessWindow.attr('data-business-type');
        var name = $businessWindow.find('.name').val(),
            income = myParseInt($businessWindow.find('.income').val());

        businessList.push({
            id: getID(),
            type: businessType,
            name: name,
            value: income
        });
        _drawBusinessList(businessType);
        calculatePassiveIncome();
        $businessWindow.find('.close-btn').click();
    }

    function _editBusiness() {
        var businessID = $businessWindow.attr('data-business-id');
        var currentBusiness = businessList.findById(businessID);
        if(currentBusiness){
            currentBusiness.name = $businessWindow.find('.name').val();
            currentBusiness.value = myParseInt($businessWindow.find('.income').val());
        }
        _drawBusinessList($businessWindow.attr('data-business-type'));
        calculatePassiveIncome();
        $businessWindow.find('.close-btn').click();
    }

    //добавить бизнес
    $businessWindow.find('.add-btn').click(function () {
        var action = $businessWindow.attr('data-action');
        switch (action){
            case 'add':
                _addBusiness();
                break;
            case 'edit':
                _editBusiness();
                break;
        }
    });
    // удаление бизнеса
    $(document).on('click', '.income .delete-business', function () {
        if(!confirm('Вы уверены что хотите удалить бизнес?')) return;
        var businessIndex = null,
            businessType;
        var id = $(this).closest('.passive-income-item').attr('data-id');
        businessList.forEach(function (business, currentIndex) {
            if(business.id == id){
                businessIndex = currentIndex;
                businessType = business.type;
                return false;
            }
        });
        if(businessIndex != null){
            businessList.splice(businessIndex, 1);
            _drawBusinessList(businessType);
            calculatePassiveIncome();
        }
    });
    // редактирование бизнеса
    $(document).on('click', '.income .edit-business', function () {
        var id = $(this).closest('.passive-income-item').attr('data-id');
        var currentBusiness;
        businessList.forEach(function (business) {
            if(business.id == id){
                currentBusiness = business;
                return false;
            }
        });
        _showBusinessWindow('edit', 'Изменить бизнес', currentBusiness);
    });


    function _showBusinessWindow(action, header, business){
        $businessWindow.attr('data-action', action);
        $businessWindow.find('.header').text(header);

        switch (typeof business){
            case 'string':
                $businessWindow.attr('data-business-type', business);
                $businessWindow.find('input').val('');
                break;
            case 'object':
                $businessWindow.attr('data-business-id', business.id);
                $businessWindow.attr('data-business-type', business.type);
                $businessWindow.find('input.name').val(business.name);
                $businessWindow.find('input.income').val(business.value);
                break;
        }
        $popUpBg.addClass('active');
        $businessWindow.addClass('active').find('input.name').focus();
    }


    $('#add-small-business-btn').click(function () {
        _showBusinessWindow('add', 'Малый бизнес:', 'small');
    });

    $('#add-big-business-btn').click(function () {
        _showBusinessWindow('add', 'Крупный бизнес:', 'big');
    });

    $('.spending input').on('input', calculateSpending);
    $('#balance-is-workless').on('click', function () {
        balance.isWorkless = this.checked;
        calculateBalance();
    });

    var land = {
        data: [],
        templateFunc: _.template(document.getElementById('land-item-template').innerHTML),
        targetElem: document.querySelector('#land tbody'),
        add: function () {
            this.data.push({
                name: $landWindow.find('.name').val(),
                amount: $landWindow.find('.amount').val(),
                price: $landWindow.find('.price').val()
            });
            this.draw();
        },
        remove: function (target) {
            if(confirm('Уверены что хотите продать?')){
                var index = Array.prototype.indexOf.call(document.querySelectorAll('#land tbody tr'), target);
                this.data.splice(index, 1);
                this.draw();
            }
        },
        draw: function () {
            var obj = this;
            this.targetElem.innerHTML = this.data.reduce(function (prevVal, currentVal) {
                return prevVal + obj.templateFunc({'item': currentVal});
            }, '');
        }
    };
    $landWindow.find('.add-btn').click(function () {
        land.add();
        $popUpBg.removeClass('active');
        $landWindow.removeClass('active');
    });
    document.getElementById('add-land-btn').addEventListener('click', function () {
        $popUpBg.addClass('active');
        $landWindow.find('input').val('');
        $landWindow.addClass('active').find('input.name').focus();
    });
    document.getElementById('land').addEventListener('click', function (e) {
        if(e.target.classList.contains('delete')){
            land.remove(e.target);
        }
    });


    // хранение данных
    function serializeData(){
        if(!localStorage) return;
        if(window.START_NEW_GAME) return;
        function getVal(id) {
            return document.getElementById(id).value;
        }
        var cashflow = {};

        cashflow.userInfo = {
            name: getVal('user-info__name'),
            position: getVal('user-info__position'),
            ambition: getVal('user-info__ambition'),
            ambitionPrice: getVal('user-info__ambition-price')
        };

        var shares = [];
        Array.prototype.forEach.call(document.querySelectorAll('#shares input'), function (item) {
            shares.push(item.value);
        });
        cashflow.shares = shares;

        cashflow.salary = getVal('salary');

        var spending = [];
        Array.prototype.forEach.call(document.querySelectorAll('#spending input'), function (item) {
            spending.push(item.value);
        });
        cashflow.spending = spending;

        cashflow.startCredits = {};
        cashflow.startCredits.apartment = getVal('start-credit-body-apartment');
        cashflow.startCredits.car = getVal('start-credit-body-car');

        cashflow.businessList = businessList;
        cashflow.realEstate = realEstate;

        cashflow.land = land.data;

        cashflow.isWorkless = balance.isWorkless;
        cashflow.debt = getVal('debt');

        localStorage.setItem('cashflow', JSON.stringify(cashflow));
    }
    window.addEventListener('unload', serializeData);


    function deserializeData(){
        if(!localStorage) return;
        function setVal(id, val) {
            document.getElementById(id).value = val;
        }
        var cashflowStr = localStorage.getItem('cashflow');
        if(cashflowStr == null) return;
        var cashflow;
        try {
            cashflow = JSON.parse(cashflowStr);
        } catch (e) {
			localStorage.removeItem('cashflow');
            return;
        }

        // userInfo
        setVal('user-info__name', cashflow.userInfo.name);
        setVal('user-info__position', cashflow.userInfo.position);
        setVal('user-info__ambition', cashflow.userInfo.ambition);
        setVal('user-info__ambition-price', cashflow.userInfo.ambitionPrice);

        //shares
        Array.prototype.forEach.call(document.querySelectorAll('#shares input'), function (item, index) {
            item.value = cashflow.shares[index];
        });

        // salary
        setVal('salary', cashflow.salary);

        // spending
        Array.prototype.forEach.call(document.querySelectorAll('#spending input'), function (item, index) {
            item.value = cashflow.spending[index];
        });
        calculateSpending();

        // start-credits
        setVal('start-credit-body-apartment', cashflow.startCredits.apartment);
        setVal('start-credit-body-car', cashflow.startCredits.car);

        cashflow.businessList.forEach(function (business) {
            business.id = getID();
            businessList.push(business);
        });
        _drawBusinessList('small');
        _drawBusinessList('big');

        cashflow.realEstate.forEach(function (estate) {
           estate.id = getID();
           realEstate.push(estate);
        });
        drawRealEstateList();
        calculatePassiveIncome();


        land.data = cashflow.land;
        if(land.data === undefined) land.data = [];
        land.draw();

        document.getElementById('balance-is-workless').checked = cashflow.isWorkless;
        balance.isWorkless = cashflow.isWorkless;
        setVal('debt', cashflow.debt);

        calculateBalance();
    }
    deserializeData();

});
