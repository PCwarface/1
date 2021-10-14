
var FacebookStatus = {
    status: "",
    authResponse: ""
};

/* get Facebook status and authResponse to be able to check it on server side */
$(window).on('load', function() {
    FB.getLoginStatus(function (response) {
        FacebookStatus.status = response.status;
        FacebookStatus.authResponse = response.authResponse;
    });
});

/* performs registration via facebook account */
function registerViaFacebook() {

    FB.login(function (response) {
        if (response.authResponse) {
            $.post("/FacebookRegister.action", {accessToken: response.authResponse.accessToken}, function(response) {
                handleResponse(response);
            });
        }
    }, { scope: 'email,user_birthday,public_profile'});
}

/* performs registration via facebook account in mobile app */
function registerViaFacebookMobileApp() {
    app_fblogin(performRegistration);
}

function performRegistration(accessToken) {
    $.get("/FacebookRegister.action", accessToken, function(response) {
        handleResponse(response);
    });
}

function handleResponse(response) {

    if (response.errors != undefined) {
        $('#fbRegErrorLabel').removeClass('hide');
        $('#fbLoginErrorLabel').addClass('hide');
        $('#fbErrorModal').modal('show');
    } else {
        location.href = '/Member.html';
    }
}

function validate() {

    var nickname = $('#registrationNickname').val();
    var password = $('#registrationPassword').val();
    var id = $('#nicknameConfirmation').data('id');
    var day = $('#myBirthDay').val();
    var month = $('#myBirthMonth').val();
    var year = $('#myBirthYear').val();

    var data = {
        id: id,
        nickname: nickname,
        password: password,
        day: day,
        month: month,
        year: year
    };

    $.post("/FacebookValidate.action", data, function(response) {

        if (response.errors != undefined && response.errors.nickname == 'registration-nickName-too-long') {
            $('#registration-nickName-is-too-long').removeClass('hide');
            $('#registration-nickName-is-empty').addClass('hide');
            $('#registration-nickName-is-not-valid').addClass('hide');
            $('#registration-incorrect-password').addClass('hide');
            return;
        }

        if (response.errors != undefined && response.errors.nickname == 'registration-nickName-is-invalid') {
            $('#registration-nickName-is-not-valid').removeClass('hide');
            $('#registration-nickName-is-empty').addClass('hide');
            $('#registration-nickName-is-too-long').addClass('hide');
            $('#registration-incorrect-password').addClass('hide');
            return;
        }

        if (response.errors != undefined && response.errors.nickname == 'registration-nickName-is-empty') {
            $('#registration-nickName-is-empty').removeClass('hide');
            $('#registration-nickName-is-not-valid').addClass('hide');
            $('#registration-nickName-is-too-long').addClass('hide');
            $('#registration-incorrect-password').addClass('hide');
            return;
        }

        if (response.errors != undefined && (response.errors.password == 'registration-password-is-empty' || response.errors.password == 'registration-password-too-short')) {
            $('#registration-nickName-is-empty').addClass('hide');
            $('#registration-nickName-is-not-valid').addClass('hide');
            $('#registration-nickName-is-too-long').addClass('hide');
            $('#registration-incorrect-password').removeClass('hide');
            return;
        }

        if (response.errors != undefined && response.errors.birthday == 'birthday-not-valid') {
            $('#registration-nickName-is-too-long').addClass('hide');
            $('#registration-nickName-is-empty').addClass('hide');
            $('#registration-nickName-is-not-valid').addClass('hide');
            $('#registration-incorrect-password').addClass('hide');
            $('#birthday-not-valid').removeClass('hide');
            return;
        }

        location.href = '/Member.html';
    });
}

/* Load Facebook SDK */
window.fbAsyncInit = function() {
    FB.init({
        appId      : '778471702292048',
        xfbml      : true,
        version    : 'v2.8'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));