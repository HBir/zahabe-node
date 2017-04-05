/*Globala variabler*/
var newMvs = 0;
var oldList = 0;
var newList = 0;
var timer = null;

console.log("script loaded");

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

function auto_grow(element) {
    element.style.height = "30px";
    element.style.height = (element.scrollHeight) + "px";
    $('#nybutton').css('height', element.scrollHeight);
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
//                 document.getElementById("nyruta").value = '';
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