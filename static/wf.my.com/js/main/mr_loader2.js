$.event.trigger({
    type: "canLoad"
});

function mr_load_block(url, id, params, type) {
    function setUrlParameter(url, key, value) {
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i=0; i<tempArray.length; i++){
                if(tempArray[i].split('=')[0] != key){
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }

        var rows_txt = temp + "" + key + "=" + value;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }

    var date = new Date(new Date().getTime() + 40 * 3600 * 1000);
    document.cookie = 'mrreferer=' + document.referrer + ';path=/; expires=' + date.toUTCString();
    document.cookie = 'mrcurrentpath=' + location.pathname + ';path=/; expires=' + date.toUTCString();

    if (!url) {
        return;
    }

    var lang = getCookie('cur_language');

    if (lang) {
        url = setUrlParameter(url, 'lang', lang);
    }

    params = params || {};
    type = type || 'GET';
    $('#' + id + '_load').show();
    $.ajax({
        async: true,
        type: type,
        url: url,
        dataType: 'html',
        data: params,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            try {
                var json = $.parseJSON(data);
            } catch (err) {
                var json = false;
            }
            if (!json) {
                $('#' + id).html(data);
                $('#' + id + '_load').hide();
            } else {
                if (json.redirect) {
                    document.location.href = json.redirect;
                } else if (json.nosdc) {
                    if (getCookie('mc')) {
						var date = new Date();
						date.setSeconds(date.getSeconds()+2)
						//setCookie('mcshmyak',1, {'expires':date.toUTCString(),'path':'/'})
                        var sdc_url = 'https://auth-ac.my.com/sdc';
						if(window.location.host =='wf.my.games'){
                            sdc_url ='https://auth-ac.my.games/sdc';
                        }
                        else if(window.location.host =='pc.warface.com'){
                            sdc_url ='https://auth.warface.com/sdc?from=https%3A%2F%2Fpc.warface.com%2Fen%2F%3Fmgmode%3D1';
                         //   document.location.href = json.host;
                        }
                        $.ajax({
                            url: sdc_url,
                            jsonp: "JSONP_call",
                            data: {
                                from: json.host
                            },
                            dataType: "jsonp",
                            success: function (response) {
                                document.location.href = json.host;
                            },
                            error: function (response) {
                                //removeItem('mc','/');
                                //removeItem('mc','/','.my.com');
                                //removeItem('mc','/','.wf.my.com');
                                //document.location.href = json.host;
                            }
                        });
                    }
                    else {
                      // removeItem('mc','/');
                      //  removeItem('mc','/','.my.com');
                        //removeItem('mc','/','.wf.my.com');
                    }
                } else {
                    if (console) {
                        console.log(json);
                    }
                }
            }
        },
        error: function (data) {
            $('#' + id).html('');
            $('#' + id + '_load').hide();
        }
    });
}


setCookie = function (name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
};

getCookie = function (name) {
    var cookie = " " + document.cookie;
    var search = " " + name + "=";
    var setStr = null;
    var offset = 0;
    var end = 0;
    if (cookie.length > 0) {
        offset = cookie.indexOf(search);
        if (offset != -1) {
            offset += search.length;
            end = cookie.indexOf(";", offset)
            if (end == -1) {
                end = cookie.length;
            }
            setStr = unescape(cookie.substring(offset, end));
        }
    }
    return (setStr);
};

function removeItem(sKey, sPath, sDomain) {
    document.cookie = encodeURIComponent(sKey) +
        "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
        (sDomain ? "; domain=" + sDomain : "") +
        (sPath ? "; path=" + sPath : "");
}

