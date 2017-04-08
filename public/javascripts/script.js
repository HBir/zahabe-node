/*Globala variabler*/
var newMvs = 0;
var oldList = 0;
var newList = 0;
var timer = null;

console.log("script loaded");
$(document).ready(function() {
    $('#cli_input').focus();
});

$(document).on("click", "#cli_output", function() {
    $('#cli_input').focus();
});

$(document).on("click", "#cli_button", function() {
    cliInput($('#cli_input').val());
});

$(document).on("keypress", "#cli_input", function(e) {
    if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();
        cliInput($(this).val());
    }
});

function cliInput(input) {
    console.log("'" + input.substring(0, 27) + "'");
    if ((cliMatch(input, "Minns vi den gången Zahabe ") || cliMatch(input, "mvdgz ")) && input.indexOf('?') > 0) {
        /** mvdgz - Add new MV */
        input = input.substring(0, input.lastIndexOf('?') + 1);
        if (input.substring(0, 6) == "mvdgz ") {
            input = input.replace("mvdgz ", "Minns vi den gången Zahabe ");
        }
        ajaxLoading(true);
        $.ajax({
                method: "POST",
                url: "/api/mvs",
                data: { mv: input }
            })
            .done(function(msg) {
                cliClear();
                if (msg.status == "error") {
                    cliOut("Something went wrong");
                }
                cliOut("Successfully added MV:\n" + input);
                refreshMvs(true);
                console.log("input Saved: " + msg);
            });
    } else if (cliMatch(input, "edit")) {
        /** edit */
        cliOut('#Redigera MV\nedit [number] [new text]\n-Not yet implemented-');
    } else if (cliMatch(input, "delete")) {
        /** delete */
        cliOut('#Ta bort MV\ndelete [number]\n-Not yet implemented-');
    } else if (cliMatch(input, "move")) {
        /** move */
        cliOut('#Flytta MV\nmove [old number] [new number]\n-Not yet implemented-');
    } else if (cliMatch(input, "story")) {
        /** story */
        cliOut('story new  #Skapa en ny story\nstory edit [number]  #Redigera story\nstory show  #Visa alla MVs med story\n-Not yet implemented-');
    } else if (cliMatch(input, "search")) {
        /** search */
        cliOut('#Hitta alla MVs som innehåller term\nsearch [term]\n-Not yet implemented-');
    } else if (cliMatch(input, "random")) {
        /** random */
        cliOut('#Visa en slumpad MV\nrandom\n-Not yet implemented-');
    } else if (cliMatch(input, "mine")) {
        /** mine */
        cliOut('#Hitta alla MVs skrivna vid samma IP address som din nuvarande IP\nmine\n-Not yet implemented-');
    } else if (cliMatch(input, "stats")) {
        /** stats */
        cliOut('#Visa statistik\nstats\n-Not yet implemented-');
    } else if (cliMatch(input, "test")) {
        /** tests something */
        // refreshMvs();
        $('#MVs').html("");
        cliOut('Testing');
    } else if (cliMatch(input, "h") || cliMatch(input, "help") || cliMatch(input, "man")) {
        /** help - Log out help commands */
        cliClear();
        let output = `help, h  #Visa alla kommando
Minns vi den gången Zahabe [text]?, mvdgz [text]?  #Ny MV
edit [number] [new text]  #Redigera MV
delete [number]  #Ta bort MV
move [old number] [new number]  #Flytta MV
story new  #Skapa en ny story
story edit [number]  #Redigera story
story show  #Visa alla MVs med story
search [term]  #Hitta alla MVs som innehåller term
random  #Visa en slumpad MV
mine  #Hitta alla MVs skrivna vid samma IP address som din nuvarande IP
stats  #Visa statistik`;
        if (input.indexOf('admin') > 0) {
            output += `\n[command] --admin [password]  #Lägg till admin privilegie`;
        }

        cliOut(output);

    } else if (input.length > 0) {
        /* Error input */
        cliOut(`...inte förstod.`);
    } else {
        /* If empty input */
        $('#cli_output').hide();
    }
};

function cliMatch(string, match) {
    return string.substring(0, match.length) == match;
}

function cliClear(callback) {
    let textbox = $('#cli_input');
    console.log(textbox.val());
    textbox.val("");
    // let i = 0;
    // (function removeLetter() {
    //     if (textbox.val() !== "") {
    //         textbox.val(textbox.val().substring(1, textbox.val().length));
    //         i++;
    //         setTimeout(removeLetter, 1);
    //     } else {
    //         console.log("complete");
    //         if (callback) {
    //             callback();
    //         }
    //     }
    // })();
}

function cliOut(text, callback) {
    $('#cli_output').show();
    $('#cli_output').html("");

    let i = 0;
    (function printLetter() {
        if (i < text.length) {
            $('#cli_output').append(text[i]);
            i++;
            setTimeout(printLetter, 1);
        } else {
            if (callback) {
                callback();
            }
        }
    })();

}

function refreshMvs(callback, force) {
    ajaxLoading(true);
    $.ajax({
            method: "GET",
            url: "/api/mvs"
        })
        .done(function(res) {
            /*       
      {{#each MVs}}
        {{#if this.Story}}
          <a href='#'><li value="{{this.cnt}}" class='MV glitch'><span class="mvContent"><span class="baffle-forever">XX</span> {{this.Text}} <span class="baffle-forever">XX</span></span></li></a>
        {{else}}
          <li class='MV' value="{{this.cnt}}" id="{{this.cnt}}"><span class="mvContent">{{this.Text}}</span></li>
        {{/if}}
      {{/each}} */

            displayMvs(res);
            ajaxLoading(false);
            callback();
        });
}

function displayMvs(list) {
    let mvRows = ``;
    for (var i = 0; i < list.length; i++) {
        if (list[i].story !== null) {
            /* No story */
            mvRows += `<li class='MV' value="${list[i].cnt}" id="${list[i].cnt}"><span class="mvContent">${list[i].Text}</span></li>`
        } else {
            /* With story */
            mvRows += `<li class='MV' value="${list[i].cnt}" id="${list[i].cnt}"><span class="mvContent">${list[i].Text}</span></li>`
        }

    }
    $('#MVs').html(mvRows);
}

function auto_grow(element) {
    element.style.height = "30px";
    element.style.height = (element.scrollHeight) + "px";
    $('#cli_button').css('height', element.scrollHeight);
    $('#bash').css('height', element.scrollHeight);
}

function ajaxLoading(on) {
    if (on) {
        $('#title').hide();
        $('#ajax_loader').show();
    } else {
        $('#title').show();
        $('#ajax_loader').hide();
    }

}

function refreshPage(type) {
    /*Kollar om några nya inlägg har lagts till och uppdaterar sidan asynkront ifall så är fallet*/
    $.get("ajaxMV.php", function(data) {
        var newList = (data.match(/<li/g) || []).length;
        setCookie("MVAmount", newList, 50);
        if (newList != oldList) {
            $("#MVs").html(data);
            if (newList - oldList > 0) {
                /*Här hanteras uppdateringsmeddelande för nya inlägg*/
                if (oldList != 0 && type != "add" && document.hasFocus() == false) {

                    newMvs = newMvs + (newList - oldList);
                    document.title = "(" + newMvs + ") Minns vi den gången Zahabe";

                    for (i = 1; i <= newMvs; i++) {
                        $("#MVs li:nth-child(" + i + ")").css('background-color', '#DCDCDC');
                        $("#MVs li:nth-child(" + i + ")").css('border-radius', '10px');
                        $("#MVs li:nth-child(" + i + ")").css('padding', '5px');
                    }
                }
                oldList = newList;
            }
        }
    });
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function refreshEditPage() {

    clearInterval(timer);

    timer = null;
    $(".MVEdit").parent().hide().slideDown();
    $.get("ajaxEditUI.php", function(data) {

        $("#MVs").html(data);
        editButtonFunctionality(data);

    });

}

function editButtonFunctionality(data) {
    /*Knapp för att ta bort MV*/
    $(".MVCross").click(function(e2) {
        e2.preventDefault();
        console.log($(this).attr("destinationurl"));
        removeMV($(this).attr("destinationurl"));
    });
    /*Knapp för att ändra MV*/
    $(".MVEdit").click(function(e) {
        e.preventDefault();


        var MV = $(this).parent().next().next();
        var nr = $(MV).val();
        var id = $(this).attr('destinationurl');
        console.log(id);
        var text = $(MV).text();
        $(MV).css("list-style-type", "none");
        $(MV).hide().html('<form class="EditForm" action="" method="post" accept-charset="utf-8" autocomplete="off">' +
            '<input name="id" type="hidden"  value="' + id + '">' +
            '<input type="integer" name="newPos" class="editPos" placeholder="#" value="' + nr + '">' +
            '<textarea name="Text" class="editRuta">' + text + '</textarea></form>').slideDown();

        $(this).html("<img src='assets/check.png' alt='edit'>");
        $(this).addClass('confirmEdit').removeClass('MVEdit');
        $(this).unbind("click");
        /*Knapp för att confirma ändring av MV*/
        $(this).click(function(event) {
            event.preventDefault();
            var url = "ajaxEditMV.php";
            $.ajax({
                type: "POST",
                url: url,
                data: $(MV).find("form").serialize(),
                success: function(data) {
                    showMessage(data);
                    refreshEditPage();
                },
                /*Visar ett felmeddelande beroende på vilken HTTP-statuskod skickas tillbaka*/
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    switch (errorThrown) {
                        case "Not Acceptable":
                            showMessage("...inte förstod");
                            break;
                        case "Conflict":
                            showMessage("...försökte duplicera sin död");
                            break;
                        case "Forbidden":
                            showMessage("...hittade det förbjudna");
                            break;
                        case "Unauthorized":
                            showMessage("...gjorde bort sig totalt");
                            break;
                        default:
                            showMessage("...fick " + errorThrown);
                    }
                }
            });
        });
    });
}

function removeMV(id) {
    var r = confirm("Säker på att du vill ta bort " + id + "?");
    if (r == true) {
        $.ajax({
            url: "ajaxRemove.php",
            type: "POST",
            data: { id: id },
            success: function(data) {
                console.log("Removed:" + data);
                refreshEditPage();
            }
        });
    } else {
        return;
    }
}

function showMessage(message) {
    if (isBlank($('#errorspace').text())) {
        $('#errorspace').hide().html(message).slideDown();
    } else {
        $('#errorspace').hide().html(message).fadeIn();
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}



// $(window).focus(function() {
//     /*Tar bort uppdateringsmeddelanden när sidan får fokus*/
//     document.title = "Minns vi den gången Zahabe";
//     newMvs = 0;
// });

// $(window).blur(function () {
//     /*Tar bort uppdateringsmarkeringar när sidan tappar fokus*/
//     $( "#MVs li" ).css('background-color', 'transparent');
// });

// $(document).ready(function() {
//     /*Lägger till nya MVs asynkront*/
//     $("#MVform").submit(function(e) {
//         var url = "add.php";

//         $.ajax({
//             type: "POST",
//             url: url,
//             data: $("#MVform").serialize(),
//             success: function(data) {
//                 document.getElementById("cli_input").value = '';
//                 $('#errorspace').html("");
//                 refreshPage("add");
//             },
//             Visar ett felmeddelande beroende på vilken HTTP-statuskod skickas tillbaka
//             error: function(XMLHttpRequest, textStatus, errorThrown) {
//                 switch (errorThrown) {
//                     case "Not Acceptable":
//                          showMessage("...inte förstod");
//                          break;
//                     case "Conflict":
//                          showMessage("...försökte duplicera sin död");
//                          break;
//                     case "Forbidden":
//                          showMessage("...hittade det förbjudna");
//                          break;
//                     case "Unauthorized":
//                          showMessage("...gjorde bort sig totalt");
//                          break;
//                     default:
//                          showMessage("...fick " + errorThrown);
//                     }
//             }
//         });
//         e.preventDefault();
//     });
// });







// $(function () {
//     $("#editActive").click(function (e) {
//         e.preventDefault();
//         $(this).unbind("click");
//         $(this).attr("href", "zahabe.php");
//         refreshEditPage();
//     });
// });




// $(window).load(function () {
//     /*Init*/
//     oldList = document.getElementById("MVs").getElementsByTagName("li").length;
//     var cookiedList = getCookie("MVAmount");
//     if (cookiedList) {
//         for (i = 1; i <= oldList - cookiedList; i++) {
//             $("#MVs li:nth-child(" + i + ")").css('background-color', '#DCDCDC');
//         }
//     }

//     timer = setInterval("refreshPage('')", 5000);
// });


// $(document).ready(function () {
//     /*Admin*/
//     $("#admin").submit(function (e) {
//         e.preventDefault();
//         url = "ajaxEditUI.php";
//         $.ajax({
//             type: "POST",
//             url: url,
//             data: $("#admin").serialize(),
//             success: function (data) {
//                 $("#MVs").html(data);
//                 editButtonFunctionality(data);
//             }
//         });
//     });
//     var alertPos = 1;

//     function moveAlert() {
//         switch (alertPos) {
//             case 0:
//                 $(".gayalert").css("top", "0px");
//                 alertPos = 1;
//                 break; 
//             case 1:
//                 $(".gayalert").css("top", "300px");
//                 alertPos = 2;
//                 console.log("ehhhh");
//                 break;
//             case 2:
//                 $(".gayalert").css("top", "600px");
//                 alertPos = 3;
//                 break;
//             case 3:
//                 $(".gayalert").css("top", "300px");
//                 alertPos = 0;
//                 break; 
//             default:
//                 console.log("what");
//                 break;
//         }
//     }


//     setInterval(moveAlert, 440);

//     moveAlert();



// });