var downloadID;
var currentIndex = 0;
var maxIndex = 5; // Including decision slide

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

$(document).ready(function() {
  downloadID = parseInt(getUrlParameter('download_id'));
  console.log(downloadID);
  $('#open').click(function() {
    chrome.downloads.show(downloadID);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://mvp.soft.carleton.ca/~advait/mmb_response.php", true);
    xhr.send(JSON.stringify({
        clientId: "malsafe-downloader",
        timestamp: "",
        value: "OPEN"
    }));

    xhr.onreadystatechange = (e) => {
      if(xhr.readyState == 4) {
        console.log(xhr);
        $('#open, #delete').css('display', 'none');
      }
    }
    //window.close();
  });
  $('#delete').click(function() {
    chrome.downloads.removeFile(downloadID);
    chrome.downloads.erase({id: downloadID});
    $('#open, #delete').css('display', 'none');
    //window.close();
  });
});
