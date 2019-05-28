var currentIndex = 0;
var maxIndex = 2; // Including decision slide

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
  var owl = $('.owl-carousel');
  owl.owlCarousel({
      loop:false,
      margin:0,
      dots:true,
      nav:false,
      items:1,
      center:true,
      URLhashListener:true,
      startPosition: 'URLHash'
  });
  $('.nextbutton').click(function() {
    if(currentIndex === maxIndex)
    {
      // Log to server
      chrome.downloads.show(parseInt(getUrlParameter('download_id')));
      currentIndex = 0;
      window.close();
    }
    else
    {
      $('.prevbutton').removeClass('buttondisabled');
      if(currentIndex + 1 === maxIndex)
      {
        $('.nextbutton').text("OPEN");
      }
      currentIndex = currentIndex + 1;
      owl.trigger('next.owl.carousel');
    }
  });
  $('.prevbutton').click(function() {
    if(!$(this).hasClass("buttondisabled"))
    {
      if(currentIndex === 1)
      {
        currentIndex = currentIndex - 1;
        $('.nextbutton').text("BEGIN");
        $('.prevbutton').addClass('buttondisabled');
      }
      else
      {
        $('.nextbutton').text("NEXT");
        currentIndex = currentIndex - 1;
      }
      owl.trigger('prev.owl.carousel');
    }
  });
});
