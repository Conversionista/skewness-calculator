/* global $*/

$('#save').on('click', function() {
    event.preventDefault();

    var d = [];

    $('table tbody tr').each(function(index, el) {
        console.log($(el).attr('id'));

        var id = $(el).attr('id'),
            inputSelector = '#' + id + ' input';
        console.log('***')
        
        var tempArr = []

        $(inputSelector).each(function(index, el) {
            console.log($(el).val())
            tempArr.push($(el).val());
        });

        var arr = [];
            arr[id] = tempArr;

        console.log(arr);
        // if (s !== null) {
        //     d.push(s);
        // } else {
        //     showError('No data?', 'There seems to be no data to save. Please hit <b>go</b> and try again.');
        // }


    });

    swal({
        title: 'An input!',
        text: 'Write something interesting:',
        type: 'input',
        showCancelButton: true,
        closeOnConfirm: false,
        animation: 'slide-from-top',
        inputPlaceholder: 'Write something'
    },
    function(inputValue) {
        if (inputValue === false) return false;
        if (inputValue === '') {
            swal.showInputError('You need to write something!');
            return false
        }
        console.log(JSON.stringify(d));
        saveLocal('fc_save_' + guidGenerator(), d);
        swal('Nice!', 'You wrote: ' + inputValue, 'success');
    });

});



