/* global $, gapi, swal, moment, numeral */
var len;
var queryData = [];

$('body').loadie();
$('.loadie').fadeIn();
var progress = 0.2

function addProgress(f) {
    progress += f;
    $('body').loadie(progress);
}

function finishProgress() {
    progress = 1
    // console.log('Finished the Loadie - '+progress);
    $('body').loadie(progress);
}

/*eslint-disable camelcase*/
window.cookieconsent_options = {
    'message': 'This website uses cookies to ensure you get the best experience.',
    'dismiss': 'Got it!',
    'learnMore': 'Read more.',
    'link': 'https://conversionista.se/kakor-och-personuppgifter/',
    'theme': 'dark-bottom'
};
/*eslint-disable camelcase*/

// Replace with your client ID from the developer console.
var CLIENT_ID = '608828753976-tempoconifjmq7mprinr4gmoqlpe6ce4.apps.googleusercontent.com';

// Set the discovery URL.
var DISCOVERY = 'https://analyticsreporting.googleapis.com/$discovery/rest';

// Set authorized scope.
var SCOPES = ['https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/plus.profile.emails.read'];

$('#go').text('Loading...');

function saveLocal(name, obj) {
    'use strict';
    localStorage.setItem(name, JSON.stringify(obj));
}

function readLocal(name) {
    'use strict';
    var data = JSON.parse(localStorage.getItem(name));
    return data;
}

function updateLocal(name, k, v) {
    'use strict';
    var data = readLocal(name);

    if (data === null) {
        data = {};
    }

    data[k] = v;
    saveLocal(name, data);
}

function setCookie(name, value, days) {
    'use strict';
    // var days = 730; // Valid for 2 years
    if (days !== false) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = '; expires=' + date.toGMTString();
        document.cookie = name + '=' + value + expires;
    }
    document.cookie = name + '=' + value;
}

function getCookie(name) {
    'use strict';
    var value = '; ' + document.cookie,
        parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        var readPart = parts.pop().split(';').shift();
        return readPart;
    }
}

function isInt(value) {
    'use strict';
    return !isNaN(value) &&
        parseInt(Number(value)) === value &&
        !isNaN(parseInt(value, 10));
}

function log(msg) {
    'use strict';
    var s = readLocal('settings');
    if (s !== null) {
        if (s.debug === true) {
            console.log(msg);
        }
    }
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

/*eslint-disable no-unused-vars*/
function debug(b) {
    'use strict';
    if (b === true) {
        updateLocal('settings', 'debug', true);
    } else {
        updateLocal('settings', 'debug', false);
    }
}
/*eslint-enable no-unused-vars*/

function getId(key) {
    'use strict';
    var l = readLocal('feasibility_calc');
    if (key === 'accountId') {
        return l.accountId;
    } else if (key === 'propertyId') {
        return l.propertyId;
    } else if (key === 'profileId') {
        return l.profileId;
    } else {
        return l;
    }

}

function showError(title, message) {
    'use strict';
    swal({
        title: title,
        html: true,
        text: message,
        type: 'error',
        confirmButtonText: 'Ok :('
    });
}

function createReportQuery(metrics) {
    'use strict';
    var l = readLocal('feasibility_calc');
    var q = {
        'viewId': l.profileId,
        'samplingLevel': 'LARGE',
        'dateRanges': [{
            'startDate': moment().subtract(28, 'days').format('YYYY-MM-DD'),
            'endDate': moment().subtract(1, 'days').format('YYYY-MM-DD')
        }],
        'metrics': metrics
    };

    return q;
}

function authorize(event) {
    'use strict';
    // Handles the authorization flow.
    // `immediate` should be false when invoked from the button click.
    addProgress(0.13);
    var useImmdiate = event ? false : true;

    /*eslint-disable camelcase*/
    var authData = {
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: useImmdiate
    };
    /*eslint-enable camelcase*/

    gapi.auth.authorize(authData, function(response) {
        // var authButton = document.getElementById('auth-button');
        log(response);
        if (response.error) {

            if (getCookie('fc_auth_count') >= 3) {


                showError('Could\'t authorize.', '<i>Check the console for details</i>.<br />If the problem presists, try some of the following: <ol><li>Try to reload the page</li><li>Clear the cookies for this website</li><li>Revoke the authorization for this app in your <a href="https://security.google.com/settings/security/permissions" target="_blank">Google Settings</a></li></ol>');
                console.info(response.error);

            } else {

                var count = parseInt(getCookie('fc_auth_count'));
                if (isInt(count) === false) {
                    count = 0;
                }

                count = parseInt(count + 1);

                setCookie('fc_auth_count', count, false);
                showAuthDialog();
            }

        } else {

            if (response.status.google_logged_in === true) {
                log('google logged in');
            }

            if (response.status.signed_in === true) {
                log('signed in');
            }


            log('Authorized');
            addProgress(0.13);
            gapi.client.load('plus', 'v1', apiClientLoaded);
            queryAccounts();




        }
    });
}

/*eslint-disable no-unused-vars*/
function queryReports(profileId, requestedReport) {
    'use strict';
    // Load the API from the client discovery URL.
    gapi.client.load(DISCOVERY).then(function() {

        // Call the Analytics Reporting API V4 batchGet method.
        gapi.client.analyticsreporting.reports.batchGet({ 'reportRequests': [requestedReport] })
            .then(function(response) {
                var formattedJson = JSON.stringify(response.result, null, 2);
                document.getElementById('query-output').value = formattedJson;
                $('#go').attr('disabled', false).html('Go!');
            })
            .then(null, function(err) {
                // Log any errors.
                showError('Reporting API Query', 'Something went wrong using the Reporting API V4.<br /> <b>Check the console for more details (cmd + alt + j).</b>');
                console.info(err);
            });
    });
}
/*eslint-enable no-unused-vars*/

function showAuthDialog() {
    'use strict';
    swal({
        title: 'GA Authorization',
        html: true,
        text: 'We\'ll need to premission to access your GA Account.<br /> We won\'t save any infomation what so ever.',
        imageUrl: 'images/noun_143742_cc.svg',
        confirmButtonText: 'Authorize',
        confirmButtonColor: '#5cb85c',
        customClass: 'authorize',
        showCancelButton: false
    });

    $('.authorize .confirm').click(function(event) {
        $(this).html('<i class="fa fa-cog fa-spin"></i>').attr('disabled', true);
        authorize(event);
    });
}

function handleAccounts(response) {
    'use strict';
    addProgress(0.13);
    if (response.result.items && response.result.items.length) {
        $('#accountId').html('').attr('disabled', false);
        $.each(response.result.items, function(index, val) {
            $('#accountId').append($('<option/>', {
                value: val.id,
                text: val.name
            }));
        });
        
        finishProgress();

        // updateLocal('feasibility_calc', 'accountId', $('#accountId').val());
        var l = readLocal('feasibility_calc');
        if (l === 'null' || l === null || l === undefined){
            $('#modalSettings').modal();
        } else {
            $('#accountId').val(l.accountId);
            queryProperties(l.accountId);
        }

    } else {
        showError('No accounts', 'No accounts found for this user.');
    }
}

function queryAccounts() {
    'use strict';
    gapi.client.load('analytics', 'v3').then(function() {
        gapi.client.analytics.management.accounts.list().then(handleAccounts);
    });
}

function handleProperties(response) {
    'use strict';
    if (response.result.items && response.result.items.length) {
        $('#propertyId').html('').attr('disabled', false);
        $.each(response.result.items, function(index, val) {
            $('#propertyId').append($('<option/>', {
                value: val.id,
                text: val.name
            }));
        });

        var l = readLocal('feasibility_calc');

        if (l.propertyId) {
            $('#propertyId').val(l.propertyId);
            queryProfiles(l.accountId, l.propertyId);
        } else {
            $('#modalSettings').modal();
        }

    } else {
        showError('No Properties', 'No properties found for this user.');
    }
}

function queryProperties(accountId) {
    'use strict';
    gapi.client.analytics.management.webproperties.list({ 'accountId': accountId })
        .then(handleProperties)
        .then(null, function(err) {
            showError('Properties Query', 'Check the console for more details.');
            console.info(err);
        });
}

function handleProfiles(response) {
    'use strict';
    if (response.result.items && response.result.items.length) {
        $('#profileId').html('').attr('disabled', false);
        $.each(response.result.items, function(index, val) {
            $('#profileId').append($('<option/>', {
                value: val.id,
                text: val.name
            }));
        });

        var l = readLocal('feasibility_calc');
        if (l.profileId) {
            $('#profileId').val(l.profileId);
        } else {
            $('#modalSettings').modal();
        }
        log(l);
        $('#go').text('Go!').attr('disabled', false);

    } else {
        showError('No Views', 'No views (profiles) found for this user.');
    }
}

function queryProfiles(accountId, propertyId) {
    'use strict';
    gapi.client.analytics.management.profiles.list({
            'accountId': accountId,
            'webPropertyId': propertyId
        })
        .then(handleProfiles)
        .then(null, function(err) {
            showError('Profiles Query', 'Check the console for more details.');
            console.info(err);
        });
}

// function calculateMDU(users, cr, defaultWeek) {
//     'use strict';
//     var sig = $('#sigLvl').val();
//     var weeks = $('#noWeeks').val();

//     if(defaultWeek !== true){
//       weeks = defaultWeek;
//     }

//     var variations = $('#noVar').val();
//     return Math.sqrt(sig * variations * (1 - cr) / cr / (users * weeks));
// }

// function querySequenceQuery(val, val1, users, id, index) {
//     'use strict';
//     // Query the Core Reporting API for the number sessions for
//     // the past seven days.
//     gapi.client.analytics.data.ga.get({
//             'ids': 'ga:' + getId('profileId'),
//             'start-date': moment().subtract(28, 'days').format('YYYY-MM-DD'),
//             'end-date': moment().subtract(1, 'days').format('YYYY-MM-DD'),
//             'metrics': 'ga:users',
//             'samplingLevel': 'HIGHER_PRECISION',
//             'segment': 'users::sequence::' + val + ';->>' + val1
//         })
//         .then(function(response) {

//             var u = parseInt(response.result.rows[0]);
//             var cr = u / users;
//             var s = '#' + id + ' .res1';

//             // var obj = {
//             //   id: id,
//             //   u2: u,
//             //   c2: cr,
//             // };
//             updateLocal(id, 'n2', val1);
//             updateLocal(id, 'u2', u);
//             updateLocal(id, 'c2', cr);


//             if(u === 0){
//               $(s).html('<i class="fa fa-warning" data-toggle="popover" data-placement="bottom" title="No users found" data-content="Please, check the spelling of your dynamic segment."></i>');
//             } else {
//               if( isFinite(cr) || isFinite(u) || !isNaN(cr) || !isNaN(u) ){
//                 $(s).html(numeral(calculateMDU(users, cr, true)).format('0%'));
//               } else {
//                 $(s).html('∞');
//               }
//             }

//             if (index === len - 1) {

//               $('#go').html('Go!').attr('disabled', false);
//               $('.showGraph').attr('disabled', false);
//               $('[data-toggle="popover"]').popover({
//                 trigger: 'hover'
//               });

//             }


//         })
//         .then(null, function(err) {
//             // Log any errors.
//             console.log(err);
//         });
// }
function presentData(data){
    $('table').show();
    $('#variance').html('<code>' + Number(data.variance).toFixed(2) + '</code>');
    $('#standardDeviation').html('<code>' + Number(data.standardDeviation).toFixed(2) + '</code>');
    $('#skewness').html('<code>' + Number(data.skewness).toFixed(2) + '</code>');
    $('#traffic').html('<code>' + Number(data.traffic).toFixed(2) + '</code>');
}

function makeArr(data){
    var arr = [];
    $.each(data, function(index, val) {
         console.log(val[1]);
         arr.push( parseInt(val[1]) );
    });
    console.log(arr)
    // console.log(skew(arr));

    return skewness(arr);
}


$(document).ready(function() {

    // The event listener for the file upload
    document.getElementById('txtFileUpload').addEventListener('change', upload, false);

    // Method that checks that the browser supports the HTML5 File API
    function browserSupportFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
        isCompatible = true;
        }
        return isCompatible;
    }

    // Method that reads and processes the selected file
    function upload(evt) {
    if (!browserSupportFileUpload()) {
        alert('The File APIs are not fully supported in this browser!');
        } else {
            var data = null;
            var file = evt.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(event) {
                var csvData = event.target.result;
                data = $.csv.toArrays(csvData);
                if (data && data.length > 0) {
                  console.info('Imported -' + data.length + '- rows successfully!');
                  // console.log(data);
                  var skew = makeArr(data);
                  console.log(skew);
                  presentData(skew);
                  
                  


                    
                    if (Math.abs(skew.skewness) >= 1){
                        $('#headline').text(Math.round(skew.traffic));
                        $('#byline').text('Based on the provided dataset (skewness: ' + skew.skewness + ') you will need ' + Math.round(skew.traffic) + ' instances for each variation.');
                        
                    } else {
                        $('#headline').text(Math.round(355));
                        console.log('😞');
                        $('#byline').text('The skewness of your data is less than 1 (' + skew.skewness + '), therefor you should use another calculator to esitmate the length of your experiment.');       
                    }
                  // $('.hero-unit').prepend('Based on provided dataset you will need')
                  // $('.hero-unit').append('instances for each variation')
                  
                } else {
                    console.info('No data to import!');
                }
            };
            reader.onerror = function() {
                alert('Unable to read ' + file.fileName);
            };
        }
    }
});



function queryTransactions() {
    'use strict';
    // Query the Core Reporting API for the number sessions for
    // the past seven days.
    gapi.client.analytics.data.ga.get({
            'ids': 'ga:' + getId('profileId'),
            'start-date': moment().subtract(28, 'days').format('YYYY-MM-DD'),
            'end-date': moment().subtract(1, 'days').format('YYYY-MM-DD'),
            'metrics': 'ga:transactionRevenue',
            'dimensions': 'ga:transactionId',
            'samplingLevel': 'HIGHER_PRECISION'
        })
        .then(function(response) {
            console.log(response.result.rows);
            var skew = makeArr(response.result.rows);
            console.log(skew);
            presentData(skew);
            // var u = parseInt(response.result.rows[0][0]);
            // var br = parseInt(response.result.rows[0][1]);
            // var cr = (100 - br) / 100;
            // var s = '#' + id + ' .res0';

            // var obj = {
            //   id: id,
            //   u2: u,
            //   c2: cr,
            // };
            // updateLocal(id, 'n1', val);
            // updateLocal(id, 'u1', u);
            // updateLocal(id, 'c1', cr);

            // if(u === 0){
            //   // $(s).html('<i class="fa fa-warning" data-toggle="popover" data-placement="bottom" title="No users found" data-content="Please, check the spelling of your dynamic segment."></i>');
            // } else {

            //   if( isFinite(cr) || isFinite(u) || !isNaN(cr) || !isNaN(u) ){
            //     console.log('hello');
            //   } else {
            //     console.log('∞');
            //   }

            // }

            // var s2 = '#' + id;
            // var i = $(s2).find('input');
            // querySequenceQuery($(i[0]).val(), $(i[1]).val(), u, id, index);

        })
        .then(null, function(err) {
            // Log any errors.
            console.log(err);
        });
}

function getFormValues() {
    'use strict';
    var row = $('table.table tbody tr');
    len = row.length;
    console.log(len);
    row.each(function(index) {
      console.log(index);
      var id = $(this).attr('id');
      var i = $(this).find('input');
      // console.log($(i[0]).val());
      queryBounceQuery($(i[0]).val(), id, index);

    });



}

$('#go').on('click', function(event) {
    'use strict';

    $(this).html('<i class="fa fa-cog fa-spin"></i>').attr('disabled', true);

    // var l = readLocal('feasibility_calc');
    // queryReports(l.profileId, createReportQuery([{ 'expression': 'ga:users' }, { 'expression': 'ga:pageviews' }, { 'expression': 'ga:transactions' }]));
    getFormValues();
    event.preventDefault();
});

/**
  * Response callback for when the API client receives a response.
  *
  * @param resp The API response object with the user email and profile information.
  */
function handleEmailResponse(resp) {
    'use strict';
    console.log(resp);
    if (!resp.error) {
        var primaryEmail;
        if (resp.emails) {
            for (var i = 0; i < resp.emails.length; i++) {
                if (resp.emails[i].type === 'account') {
                    primaryEmail = resp.emails[i].value;
                }
            }

            if (primaryEmail) {

                // console.info(resp);
                fcIdentify(resp.displayName, primaryEmail);
                hideLoginButton();
            }
        }

    }
}

/**
  * Sets up an API call after the Google API client loads.
  */
function apiClientLoaded() {
    'use strict';
    gapi.client.plus.people.get({ userId: 'me' }).execute(handleEmailResponse);
}


/*eslint-disable no-unused-vars*/
/**
  * Handler for the signin callback triggered after the user selects an account.
//   */
// function onSignInCallback(resp) {
//    'use strict';
//    gapi.client.load('plus', 'v1', apiClientLoaded);
// }
/*eslint-enable no-unused-vars*/

// $('.btn-social-icon.btn-google').on('click', function(event) {
//     event.preventDefault();
//     /* Act on the event */
//     $('body').append('<script src="https://plus.google.com/js/client:platform.js?onload=onSignInCallback" async defer></script>');

// });


function fcIdentify(name, email) {
    'use strict';
    log(name + '\n' + email);
}

function hideLoginButton() {
    'use strict';
    $('#gConnect').hide();
    // console.info('hide button');
}

$('#accountId').on('change', function() {
    'use strict';
    queryProperties(this.value);
    updateLocal('feasibility_calc', 'accountId', this.value);
});

$('#propertyId').on('change', function() {
    'use strict';
    queryProfiles($('#accountId').val(), this.value);
    updateLocal('feasibility_calc', 'propertyId', this.value);
});

$('#profileId').on('change', function() {
    'use strict';
    updateLocal('feasibility_calc', 'profileId', this.value);
});


$(document).ready(function() {
    'use strict';
    $(':checkbox').checkboxpicker();
    $('[data-toggle="tooltip"]').tooltip();
});

$('#getTransactions').on('click', function(event) {
    event.preventDefault();
    /* Act on the event */
    queryTransactions();
});