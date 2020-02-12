//this function will be called after the JavaScriptApplet code has been loaded.
smilesArray = [];
function jsmeOnLoad() {
    jsmeApplet = new JSApplet.JSME("jsme_container", "480px", "450px", {
        "options": "oldlook,star"

    });
}


function get_from_csv() {
    //https://stackoverflow.com/questions/12281775/get-data-from-file-input-in-jquery
    var form = $("#smiles_form");
    form.submit(function (event) {
        event.preventDefault();
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
            return;
        }
        var input = $("#smiles_file");
        if (!input[0].files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.");
        }
        else if (!input[0].files[0]) {
            alert("Please select a file before clicking 'Load'");
        }
        else {
            var file = input[0].files[0];
            var fr = new FileReader();
            // fr.onload = receivedText;
            //fr.readAsText(file);
            // fr.readAsDataURL(file);
            fr.onload = function (e) {
                var resultFile = fr.result;
                console.log("Smiles: " + fr.result);
                smilesArray = resultFile.split("\n");
                if (smilesArray.length > 1) {
                    console.log("1st: " + String(smilesArray[1]));
                }
            };
            fr.readAsText(file);

        }
    });

}
function secureChemPredictor() {
    //   var keycloak = Keycloak({
    //     "realm": "jaqpot",
    //     "auth-server-url": "https://localhost:8180/auth/",
    //     //"ssl-required": "external",
    //     "enable-cors": true,
    //     "resource": "chemPredictor",
    //     "clientId": "chemPredictor",
    //     "public-client": true,
    //     "confidential-port": 0
    //   });
    var keycloak = Keycloak("http://localhost:4200/assets/keycloak.json");
    keycloak.init({ promiseType: 'native', onLoad: "login-required" }).then(function (authenticated) {
        //alert(authenticated ? 'authenticated' : 'not authenticated');
        if (authenticated == true) {
            keycloak.updateToken(30).then(function () {
                //chemPredict(keycloak.token);
                chemPredict();
            }).catch(function () {
                alert('Failed to refresh token');
            });
        }
    }).catch(function () {
        alert('failed to initialize');
    });
}
function chemPredict() {

    //alert("chemPredict " + auth);
    var urlLogin = "http://localhost:8080/jaqpot/services/aa/login";
    username = "";
    password = "";

    $.ajax(urlLogin, {
        method: 'POST',
        contentType: "application/x-www-form-urlencoded",
        //context: document.body,
        data: {
            username: username,
            password: password
        }
        //data: '"'+btoa("username="+username+"&password="+password)+'"'
    })
        .then(
            function success(data) {
                // userInfo will be a JavaScript object containing properties such as
                // name, age, address, etc
                auth = data.authToken;
                //alert("successful call");
                console.log('Succesful call ');
                console.log("authToken: " + auth);

                var all_model_url = "http://localhost:8080/jaqpot/services/model"

                $.ajax(all_model_url, {
                    method: 'GET',
                    contentType: 'application/json;',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Accept", "*/*");
                        xhr.setRequestHeader("Authorization", "Bearer " + auth);
                        //xhr.setRequestHeader("Content-Type","multipart/form-data"+"; boundary= 'anotherCOOLboundery'");
                        xhr.setRequestHeader("Connection", "keep-alive");
                    },
                    dataType: 'json',
                    processData: false,
                    data: {}
                })
                    .then(
                        function success(modelData) {
                            // userInfo will be a JavaScript object containing properties such as
                            // name, age, address, etc
                            console.log('Succesful call: Models 2');
                            var visited = new Map();
                            var models = "";
                            modelData.forEach(function (model, index) {
                                //alert("model " + model._id);
                                var modelURI = "http://localhost:8080/jaqpot/services/model/" + model._id;
                                $.ajax(modelURI, {
                                    method: 'GET',
                                    contentType: 'application/json;',
                                    beforeSend: function (xhr) {
                                        xhr.setRequestHeader("Accept", "*/*");
                                        xhr.setRequestHeader("Authorization", "Bearer " + auth);
                                        //xhr.setRequestHeader("Content-Type","multipart/form-data"+"; boundary= 'anotherCOOLboundery'");
                                        xhr.setRequestHeader("Connection", "keep-alive");
                                    },
                                    dataType: 'json',
                                    processData: false,
                                    data: {}
                                })
                                    .then(
                                        function success(item) {
                                            // userInfo will be a JavaScript object containing properties such as
                                            // name, age, address, etc
                                            console.log('Succesful call: specific Model id ' + item._id);
                                            var dependentFeature = String(item.dependentFeatures);
                                            var featureURI = dependentFeature;
                                            //alert("DFeature: "+featureURI);
                                            $.ajax(featureURI, {
                                                method: 'GET',
                                                contentType: 'application/json;',
                                                beforeSend: function (xhr) {
                                                    xhr.setRequestHeader("Accept", "*/*");
                                                    xhr.setRequestHeader("Authorization", "Bearer " + auth);
                                                    //xhr.setRequestHeader("Content-Type","multipart/form-data"+"; boundary= 'anotherCOOLboundery'");
                                                    xhr.setRequestHeader("Connection", "keep-alive");
                                                },
                                                dataType: 'json',
                                                processData: false,
                                                data: {}
                                            })
                                                .then(
                                                    function success(feature) {
                                                        // userInfo will be a JavaScript object containing properties such as
                                                        // name, age, address, etc
                                                        console.log('Succesful call: specific Feature');
                                                        var title = String(feature.title);
                                                        var myElem = $("#feature_list");
                                                        //alert("title: "+title);
                                                        if (visited.has(title) != true) {
                                                            models = String(item._id) + ",";
                                                            visited.set(title, models);
                                                            console.log("visited: title " + title + " models: " + visited.get(title));

                                                            myElem.append($("<option></option>").attr("id", title).html(title));
                                                            $("#" + title).attr("value", models);
                                                        }
                                                        else {
                                                            models = visited.get(title);
                                                            models = models + String(item._id) + ",";
                                                            visited.set(title, models);
                                                            $("#" + title).attr("value", models);
                                                        }

                                                    },
                                                    function fail(feature, status) {
                                                        alert('Request failed.  Returned status of ' + status);
                                                    }
                                                );
                                        },
                                        function fail(item, status) {
                                            alert('Request failed.  Returned status of ' + status);
                                        });
                            });
                        },
                        function fail(models, status) {
                            alert('Request failed.  Returned status of ' + status);
                        }
                    );


            },
            function fail(data, status) {
                alert('Request failed.  Returned status of ' + status);
            }
        );


}
function print_features() {
    // var features = [{ meta: { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], titles: ["SCH-6"], creators: ["c3230bcd-a549-48b9-83d6-0e762688f976"], hasSources: ["model/Vh6Zu6s58yUsMuZ3kAMf"], date: "2019-12-10T15:17:47.399+0000", locked: false }, title: "SCH-6", _id: "3ac1c0195f5b47299f6d4c662c796377" }, { meta: { descriptions: ["Feature created to link to independent feature of model svm-model-cdk2"], titles: ["tpsaEfficiency"], creators: ["c3230bcd-a549-48b9-83d6-0e762688f976"], hasSources: ["model/Vh6Zu6s58yUsMuZ3kAMf"], date: "2019-12-10T15:17:47.398+0000", locked: false }, title: "tpsaEfficiency", _id: "b805e9ce3c6b4951809ccff8605ccbd7" }, { meta: { descriptions: ["Feature created to link to independent feature of model svm-model-cdk2"], titles: ["tpsaEfficiency"], creators: ["c3230bcd-a549-48b9-83d6-0e762688f976"], hasSources: ["model/CCVh6Zu6s58yUsMuZ3Mf"], date: "2019-12-10T15:17:47.398+0000", locked: false }, title: "tpsaEfficiency", _id: "b805e9ce3c6b4951809ccff8605ccbd7" }];
    //var features = [{ "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/999999999s58yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "3ac1c0195f5b47299f6d4c662c796377" }, { meta: { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], titles: ["SCH-6"], creators: ["c3230bcd-a549-48b9-83d6-0e762688f976"], hasSources: ["model/666666u6s58yUsMuZ3kAMf"], date: "2019-12-10T15:17:47.399+0000", locked: false }, title: "SCH-6", _id: "3ac1c0195f5b47299f6d4c662c796377" }, { meta: { descriptions: ["Feature created to link to independent feature of model svm-model-cdk2"], titles: ["tpsaEfficiency"], creators: ["c3230bcd-a549-48b9-83d6-0e762688f976"], hasSources: ["model/7777777771SY0iOk4uYbkSl"], date: "2019-12-10T15:17:47.398+0000", locked: false }, title: "tpsaEfficiency", _id: "b805e9ce3c6b4951809ccff8605ccbd7" }, { meta: { descriptions: ["Feature created to link to independent feature of model svm-model-cdk2"], titles: ["tpsaEfficiency"], creators: ["c3230bcd-a549-48b9-83d6-0e762688f976"], hasSources: ["model/111111u6s58yUsMuZ3kAMf"], date: "2019-12-10T15:17:47.398+0000", locked: false }, title: "tpsaEfficiency", _id: "b805e9ce3c6b4951809ccff8605ccbd7" }];
    var features = [{ "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/0000008yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "88881c0195f5b47299f6d4c662c796377" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/5555558yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "88881c0195f5b47299f6d4c662c796377" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/666666008yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "88881c0195f5b47299f6d4c662c796377" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/11111u6s58yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "000!88881c0195f5b47299f6d4c662c796377" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/22222s58yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "111!88881c0195f5b47299f6d4c662c796377" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/333336s58yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "9999ac1c0195f5b47299f6d4c662c796377" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["SCH-6"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/44444s58yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "SCH-6", "_id": "3ac1c0195f5b47299f6d4c662c796377" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model svm-model-cdk2"], "titles": ["VC"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/Vh6Zu6s58yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "VC", "_id": "3ac1c0195f5b47299f6d4c662c796300" }, { "meta": { "descriptions": ["Feature created to link to independent feature of model "], "titles": ["VC"], "creators": ["c3230bcd-a549-48b9-83d6-0e762688f976"], "hasSources": ["model/Vh6Zu6s58yUsMuZ3kAMf"], "date": "2019-12-10T15:17:47.399+0000", "locked": false }, "title": "VC", "_id": "1ac1c0195f5b47299f6d4c662c796377" }];
    var visited = new Map();
    var models = "";
    var myElem = $("#feature_list");
    for (var i = 0; i < features.length; i++) {
        var f = features[i];
        if (String(f.meta.hasSources).includes("model") == true) {
            if (visited.has(f.title) != true) {
                models = String(f.meta.hasSources).replace("model/", "") + ",";
                visited.set(f.title, models);
                myElem.append($("<option></option>").attr("id", f.title).html(f.title));
                $("#" + f.title).attr("value", models);
            }
            else {
                models = visited.get(f.title);
                models = models + String(f.meta.hasSources).replace("model/", "") + ",";
                visited.set(f.title, models);
                $("#" + f.title).attr("value", models);
            }
        }
    }
}
function show_models() {
    clear_response();
    $("#model_container").children().remove();
    //https://stackoverflow.com/questions/10659097/jquery-get-selected-option-from-dropdown
    var selected_element = $('#feature_list').find(":selected");
    //var models = selected_element.attr("value").split(",");
    var models = selected_element.attr("value");
    models = models.slice(0, models.length - 1);
    var featureName = selected_element.attr("id");
    div_list(models, featureName);


}
function div_list(models, featureName) {

    var modelsArray = models.split(",");
    //alert("models's length" + modelsArray.length);
    var plithos = modelsArray.length;
    var num = 2;
    var range = Math.min(plithos, num);
    for (var i = 0; i < range; i++) {
        // models.forEach(function (item, index) {
        var item = modelsArray[i];
        index = i;
        //console.log("len: " + plithos + " model: " + item);
        //alert("m" + item);
        //alert("Print_div_model " + featureName);
        if (item != "") {
            var mySelect = $('#model_container');
            console.log(item);
            mySelect.append($('<div  class= "model"  onclick = "chemPredictorCall(this)"></div>').attr("id", item).attr("name", featureName).html(item));
            var anOption = $('#' + item);
            anOption.mouseover(function () {
                var modelId = String($(this).attr("id"));
                var model_url = "http://localhost:8080/jaqpot/services/model/" + modelId;
                console.log("This is modelURL: " + model_url);
                $("#" + modelId).append($('<div></div>').attr("id", "model_info_list"));

                // $.each(item.meta, function (k, v) {
                //   $("#model_info_list").append($('<span></span>').html(k + " : " + v + "<br>"));
                // });
                // $("#model_info_list").append($('<span></span>').html("featureName : " + item.meta.creator + "</br>"));
                // $("#" + item._id).attr("val", item.meta.date);

                $.ajax(model_url, {
                    method: 'GET',
                    contentType: 'application/json;',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Accept", "*/*");
                        xhr.setRequestHeader("Authorization", "Bearer " + auth);
                        //xhr.setRequestHeader("Content-Type","multipart/form-data"+"; boundary= 'anotherCOOLboundery'");
                        xhr.setRequestHeader("Connection", "keep-alive");
                    },
                    dataType: 'json',
                    processData: false,
                    data: {}
                })
                    .then(
                        function success(data) {
                            //console.log("Successful call - get by model id");
                            console.log("modelId iiss: " + data._id);
                            console.log("modelId meta: " + JSON.stringify(data.meta));
                            $.each(data.meta, function (k, v) {
                                $("#model_info_list").append($('<span></span>').html(k + " : " + v + "<br>"));
                            });
                            $("#model_info_list").append($('<span></span>').html(featureName));
                            $("#model_info_list").append("</br>");
                            $("#model_info_list").append($('<span></span>').html("algorithm : " + data.algorithm._id));
                        },
                        function fail(data, status) {
                            alert('Request failed.  Returned status of ' + status);
                        }

                    );
            });
            anOption.on('mouseout', function () {
                $("#model_info_list").removeAttr("style");
                $("#model_info_list").find('span').remove();
                $("#model_info_list").remove();

            });
            $("#model_additional_info_container").on('mouseover', function () {
                anOption.unbind("mouseover mouseout");
            });
        }
    }
    var modelsNext;
    if ((index == (num - 1)) && (plithos > num)) {
        //console.log("index: " + index + " plithos " + plithos);
        var count = 0;
        for (var j = num; j < plithos; j++) {
            if (count == 0) {
                modelsNext = String(modelsArray[j]) + ",";
                // console.log("inside loop " + modelsNext);
            }
            else {
                modelsNext = modelsNext + String(modelsArray[j]) + ",";
                // console.log("inside loop " + modelsNext);
            }
            count++;
        }
        modelsNext = modelsNext.slice(0, modelsNext.length - 1);
        // console.log("modelsNext2:  " + modelsNext);

        //$("#more").click(function () { div_list(modelsNext, featureName); });
        $("#more").remove();
        $("#model_container").append($("<button></button>").attr("id", "more").html("More"));
        $("#more").click(function () { div_list(modelsNext, featureName); });
        //$("#more").attr("class", "visible");
    }
    else {
        $("#more").remove();
        //$("#more").attr("class", "invisible");
    }
    //);
}

function chemPredictorCall(elem) {
    clear_response();
    //var ldld = new ldLoader({ root: "#my-loader" });
    //ldld.on();
    var modelId = String(elem.getAttribute("id"));
    var modelURI = "http://localhost:8080/jaqpot/services/model/" + modelId;
    $.ajax(modelURI, {
        method: 'GET',
        contentType: 'application/json;',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Accept", "*/*");
            xhr.setRequestHeader("Authorization", "Bearer " + auth);
            //xhr.setRequestHeader("Content-Type","multipart/form-data"+"; boundary= 'anotherCOOLboundery'");
            xhr.setRequestHeader("Connection", "keep-alive");
        },
        dataType: 'json',
        processData: false,
        data: {}
    })
        .then(
            function success(item) {
                // userInfo will be a JavaScript object containing properties such as
                // name, age, address, etc
                console.log('Succesful call: CHECK specific Model id ' + item._id);
                console.log("item.independentFeatures: " + JSON.stringify(item.independentFeatures));
                if (item.independentFeatures.length == 0) {
                    $("#my-loader").attr("class", "invisible");
                    alert("This model has no input features specified and therefore it is not trained well. \n Pick another one...");
                    return;
                }
                else {
                    $("#my-loader").attr("class", "visible");

                    //alert(modelId);
                    var featureURI = String(elem.getAttribute("val"));
                    var featureName = String(elem.getAttribute("name"));
                    //var smilesInput = String(jsmeApplet.smiles());
                    //var smilesInput = "[Cu+2].[O-]S(=O)(=O)[O-],CC[C@H](O1)CC[C@@]12CCCO2,CC(=O)NCCC1=CNc2c1cc(OC)cc2,OCCc1c(C)[n+](=cs1)Cc2cnc(C)nc(N)2";
                    smilesInput = "";
                    if (Array.isArray(smilesArray) && smilesArray.length == 0) {
                        // if (smilesArray === undefined || smilesArray == []) {
                        smilesInput = String(jsmeApplet.smiles());
                    }
                    else {
                        for (var i = 1; i < smilesArray.length; i++) {
                            smilesInput = smilesInput + smilesArray[i] + ",";
                        }
                        smilesInput = smilesInput.substring(0, smilesInput.length - 1);
                    }
                    if (smilesInput == null || smilesInput == "" || smilesInput == undefined) {
                        $("#my-loader").attr("class", "invisible");
                        alert("Smiles input is missing...");
                        return;
                    }

                    //alert(smilesInput);
                    var chemPredict_url = "http://localhost:8080/jaqpot/services/chemPredictor/apply";

                    //repeatedAJAXCalls1(0);
                    $.ajax(chemPredict_url, {
                        method: 'POST',
                        contentType: 'application/json;',
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Accept", "*/*");
                            xhr.setRequestHeader("Authorization", "Bearer " + auth);
                            //xhr.setRequestHeader("Content-Type","multipart/form-data"+"; boundary= 'anotherCOOLboundery'");
                            xhr.setRequestHeader("Connection", "keep-alive");
                        },
                        processData: false,
                        // dataType: "string",
                        data: JSON.stringify({
                            smilesInput: smilesInput,
                            parameters: { "categories": ["all"] },
                            modelId: modelId,
                            predictionFeature: featureURI
                        })
                    })
                        .then(
                            function success(data) {
                                // userInfo will be a JavaScript object containing properties such as
                                // name, age, address, etc
                                console.log('Succesful call 5');
                                var task_url = String(data);
                                repeatedAJAXCalls(task_url, 0, featureName);

                            },
                            function fail(data, status) {
                                alert('Request failed.  Returned status of ' + status);
                            }
                        );
                }

            },
            function fail(data, status) {
                alert('Request failed.  Returned status of ' + status);
            }
        );


}
function show(result, featureName) {
    $("#my-loader").attr("class", "invisible");
    var res = JSON.parse(result);
    //alert("inside show" + res);
    $("#response_container").attr("class", "visible");
    //$("#response_container").children($("<p></p>")).attr("class", "visible");
    $("#response_container").append($("<table></table>").attr("id", "response"));
    $("#response_container").append($("<button id='clear_response' onclick='clear_response()'></button>").html("Clear"));

    for (var i = 0; i < res.length; i++) {
        // if (i == 0) {
        //   $("#response").append($("<tr></tr>").attr("class", "header"));
        //   var fe = $(".header");

        //   $.each(res[i], function (k, v) {
        //     fe.append($("<th></th>").html(k));
        //   });
        if (i == 0) {
            $("#response").append($("<tr></tr>").attr("class", "header"));
            // $("#response").css({"border": "2px","solid": "silver","width": "auto","margin-right": "100px"});
            var fe = $(".header");
            fe.append($("<th></th>").html(featureName));
            fe.append($("<th></th>").html("Smiles"));
        }
        console.log(JSON.stringify(res[i]));
        print_row_table(res[i], i, featureName);
        var sar = smilesInput.split(",");
        print_smiles(sar[i], i);

    }

}

function print_smiles(item, index) {
    var elem = $("#" + index);
    elem.append($("<td></td>").html(item));

}
function print_row_table(item, index, featureName) {
    //alert("inside print_row" + featureName);

    $("#response").append($("<tr></tr>").attr("id", index));
    var elem = $("#" + index);
    $.each(item, function (k, v) {
        if (k == featureName) {
            elem.append($("<td></td>").attr("class", k).html(v));
        }
    });
}
function repeatedAJAXCalls(task_url, i, featureName) {

    $.ajax(task_url, {
        method: 'GET',
        contentType: 'application/json;',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Accept", "*/*");
            xhr.setRequestHeader("Authorization", "Bearer " + auth);
            //xhr.setRequestHeader("Content-Type","multipart/form-data"+"; boundary= 'anotherCOOLboundery'");
            xhr.setRequestHeader("Connection", "keep-alive");
        },
        processData: false,
        dataType: "json",
        data: {}
    })
        .then(
            function success(data, status, request) {
                // userInfo will be a JavaScript object containing properties such as
                // name, age, address, etc
                i++;
                console.log('Succesful call ' + String(i) + " " + task_url + " " + featureName);
                console.log('Status: ' + data.status);
                if (data.status == "RUNNING" || data.status == "QUEUED") {

                    setInterval(repeatedAJAXCalls(task_url, i, featureName), 180000);

                } else if (data.status == "COMPLETED") {
                    $("#my-loader").attr("class", "invisible");

                    var result = data.result;
                    // alert("Result: "+result);
                    show(result, featureName);
                }

            },
            function fail(data, status) {
                alert('Request failed.  Returned status of ' + status);
            }
        );

}

function clear_response() {
    $("#response").children().remove();
    $("#response").remove();
    $("#clear_response").remove();
}