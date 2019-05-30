var tempDownloadID;
var safebrowsingkey = config.API_KEY;

function initializeLatestDownload(item) {
  downloadFileName =  /[^/]*$/.exec(item.filename)[0];
  if(item.exists === true  && downloadFileName !== "") {
    var downloadID, downloadFileSizeTxt, downloadFileName, downloadStartTimeTxt;
    $("#errortext").css("display", "none");
    downloadsAvail = true;
    downloadID = item.id;
    downloadFileSizeTxt = formatBytes(item.fileSize, 1);
    downloadStartTimeTxt = timeDifference(new Date(), new Date(item.startTime));
    chrome.downloads.getFileIcon(item.id, {'size': 80}, function(fileURL) {
      var tablerowtext = '\
      <li id="downloaditem" class="'+downloadID+'"><table><tr>\
      <td id="information">\
        <table id="infotable" class="'+downloadID+'" title="Open analysis">\
          <tr>\
            <td id="td1" class="'+downloadID+'">\
              <img id="fileicon" src="'+fileURL+'"></a>\
            </td>\
            <td id="td2">\
              <div id="metaholder">\
                <p id="filename">'+downloadFileName+'</p>\
                <p id="filemeta">'+downloadFileSizeTxt+' • '+downloadStartTimeTxt+'</p>\
              </div>\
            </td>\
          </tr>\
        </table>\
      </td>\
      <td id="actionbutton1">\
        <img id="openanalysis" src="../icons/safenext.png">\
      </td>\
      </tr></table></li>';
      $('#downloadlist').append(tablerowtext);
    });
  }
}


// Helper functions
function removeItem(downloadID) {
  console.log(downloadID);
  chrome.downloads.removeFile(downloadID);
  chrome.downloads.erase({id: downloadID});
  window.close();
}

function openItem(tempDownloadID) {
  if(window.confirm("By running this application as an administrator, you will be granting it permission to all your files (including browsing history, email contents, and \
files of all other apps you\'ve installed on this device). Are you sure you wish to allow this?")) {
    chrome.downloads.open(tempDownloadID);
  } else {
    // Do nothing
  }
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function onError(error) {
  console.log(`Error: ${error}`);
}


// Runtime functions
chrome.downloads.search({
  orderBy: ["-startTime"]
}, function(downloadItems) {
  if (downloadItems.length > 0) {
    for (i = 0; i < downloadItems.length; i++) {
      initializeLatestDownload(downloadItems[i]);
    }
  }
});

chrome.browserAction.setIcon({path: "../icons/shield_active.png"});
chrome.browserAction.setBadgeText({text: ""});

$(document).on('click', '#downloaditem', function(e) {
  tempDownloadID = parseInt($(this).attr("class"));
  $('#logo').css("display", "none");
  $('#headertext').css("display", "block");
  $('#back').css("display", "block");
  $('#downloadlist').css("display", "none");
  $('#itemanalysis').css("display", "block");
  chrome.downloads.search({id: tempDownloadID}, function(item) {
    $('#resultsloading').css("display","block");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://safebrowsing.googleapis.com/v4/threatMatches:find?key="+safebrowsingkey, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      client: {
        clientId: "malsafe-downloader",
        clientVersion: "1.0"
      },
      threatInfo: {
        threatTypes:      ["MALWARE", "SOCIAL_ENGINEERING", "THREAT_TYPE_UNSPECIFIED", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes:    ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [
          {url: item[0].url}
        ]
      }
    }));

    xhr.onreadystatechange =(e)=> {
      if(xhr.readyState == 4) {
        $('#resultsloading').css("display","none");
        $('#analysis').css('display', 'block');
        var responseObj = JSON.parse(xhr.responseText);
        if("matches" in responseObj) {
          /*$('body').css('background', 'red');
          *$('#analysisheader').text("Malicious Download");
          $('#analysisheader').css("color", "white");
          $('#analysismessage').text("This file was flagged by Google as a malicious file. The best course of action is to delete this file immediatelly to prevent it from harming your computer.");
          $('#analysismessage').css("color", "white");
          $("#harmfulaction").css("display", "table");
          $("#normalaction").css("display", "none");*/
          $('body').css('background', '#f6faff');
          $('#analysisheader').text("Potentially Malicious");
          $('#analysisheader').css("color", "#35425b");
          $('#analysismessage').html("There is a chance this file is malware. Are you sure you wish to open it?");
          $('#analysismessage').css("color", "#35425b");
          $("#harmfulaction").css("display", "table");
          $("#normalaction").css("display", "none");
          console.log("This is an unsafe site");
          //chrome.tabs.create({ url : chrome.extension.getURL("../pages/warning.html")});
          // Log to database
        } else {
          $('body').css('background', '#f6faff');
          $('#analysisheader').text("Your Download");
          $('#analysisheader').css("color", "#35425b");
          $('#analysismessage').html("This file did not show up in any of our malware checks, however we recommend you exercise caution by opening the file only if you trust <a href='http://"+(new URL(item[0].url)).hostname+"'>"+(new URL(item[0].url)).hostname+"</a>.");
          $('#analysismessage').css("color", "#35425b");
          $("#harmfulaction1").css("display", "block");
          $("#harmfulaction").css("display", "none");
          $("#normalaction").css("display", "table");
          console.log("This is a safe site");
        }
        //console.log("Google Safe Browsing Response: "+xhr.response);
      }
    }
  });
  //openItem(tempDownloadID);
});

$(document).on('click', '#close', function(e) {
  window.close();
});

$(document).on('click', '#openfile', function(e) {
    chrome.downloads.open(tempDownloadID);
});

$(document).on('click', '#openfolder2', function(e) {
    chrome.downloads.show(tempDownloadID);
    window.close();
});

$(document).on('click', '#malwaretutorial, #openfolder1', function(e) {
    chrome.tabs.create({ url : chrome.extension.getURL("../pages/welcome.html?download_id="+tempDownloadID)});
});

$(document).on('click', '#back', function(e) {
  $('body').css('background', '#f6faff');
  $('#logo').css("display", "block");
  $('#headertext').css("display", "none");
  $('#back').css("display", "none");
  $('#downloadlist').css("display", "block");
  $('#itemanalysis').css("display", "none");
  $('#resultsloading').css("display","none");
  $('#analysis').css('display', 'none');
});
