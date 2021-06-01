var Ovl = {
  target: null,
  gallery: {
    url: '',
    set: '',
    elements: null,
    index: null,
    max: null
  },
  wrapper: {
    main: '<div class="ovl-wrap">\
              <div class="ovl-align">\
                <div class="ovl"></div>\
              </div><div class="middle"></div>\
            </div>',
    fade: '<div class="ovl-fade"></div>',
    arrows: '<div class="ovl-arrow ovl-arrow-left"><div class="b-link js-gallery-nav" data-direction="prev"></div></div>\
            <div class="ovl-arrow ovl-arrow-right"><div class="b-link js-gallery-nav" data-direction="next"></div></div>',
    close: '<i class="ovl-close js-ovl-close"></i>'
  },
  open: function(type, element, form, classname){
    Ovl.wrapCreate();
    if (classname) {
        $('.ovl-wrap').addClass(classname);
    }
    if (form == true) {
        $('.ovl-wrap').addClass('ovl-form');
    }
    switch (type) {

      // JS call ajax load
      case 'click':

        if ($(element).attr('data-video')) {
          $('.ovl').addClass('gallery video').append('<div class="gallery__header"></div>');
          Ovl.video($(element).attr('data-video'));
        }
        else if ($(element).attr('data-gallery-url')) {
            $('.ovl').addClass('gallery').append('<img src="' + $(element).attr('data-gallery-url') + '">' + Ovl.wrapper.close);
            $('.ovl').append('<div class="gallery__header"></div>');
            Ovl.gallery.url = $(element).attr('data-gallery-url');
            if($(element).attr('data-gallery-num')) {
              filePathEndPos = Ovl.gallery.url.lastIndexOf('/');
              filename = Ovl.gallery.url.substr(filePathEndPos + 1, Ovl.gallery.url.lastIndexOf('.') - 1 - filePathEndPos);

              Ovl.gallery.set = 'false';
              Ovl.gallery.elements = Ovl.gallery.url.substr(0, filePathEndPos)+'/';
              $('.ovl .gallery__header').append(Ovl.wrapper.arrows);
              Ovl.gallery.index = (parseInt(filename)-1);
              Ovl.gallery.max = parseInt($(element).attr('data-gallery-num'));
            } else {
              Ovl.gallery.set = $(element).attr('data-gallery-set');
              Ovl.gallery.elements = $('body').find('div[data-gallery-set="' + Ovl.gallery.set + '"]');
              Ovl.gallery.max = Ovl.gallery.elements.length;
              if(Ovl.gallery.elements.length > 1)
                $('.ovl .gallery__header').append(Ovl.wrapper.arrows);
              Ovl.gallery.index = Ovl.gallery.elements.index($(element));
            }
        }
        else if ($(element).attr('data-ovl-url')) {
            var target = $(element).attr('data-ovl-url');
            Ovl.loadAjax(target);
        }
        else {
            Ovl.target = $('div[data-ovl-target=' + $(element).attr('data-ovl-link') + ']');
            Ovl.loadHiddenBlock(Ovl.target);
        }
        break;

      // JS call ajax load
      case 'ajax':
        Ovl.loadAjax(element);
        break;

      // JS call hidden block show
      case 'block':
        Ovl.loadHiddenBlock(element);
        break;

      // Video
      case 'video':
        Ovl.video(element);
        break;
    }
    var eventName = new Event('ovlOpened');
    document.dispatchEvent(eventName);
  },

  //Create wrapper
  wrapCreate: function(){
    if ($('.ovl-wrap').length) {
      Ovl.moveContentBack();
      $('.ovl').html('');
    }
    else {
      $('body').append(Ovl.wrapper.fade).addClass('ovl-opened').append(Ovl.wrapper.main);
    }
  },

  // Hidden HTML block show in ovl
  loadHiddenBlock: function(block){
    Ovl.target = block;
    block.find('> div').appendTo('.ovl');
    $('.ovl').append(Ovl.wrapper.close);
  },

  // Ajax data show in ovl
  loadAjax: function(url){
    Ovl.target = null;
    var _this = $('.ovl'),
    dynamicData = url;
    if (dynamicData.length > 0) {
      $.ajax({
          url: dynamicData,
          type: 'GET',
          dataType: 'html',
      })
      .done(function (data) {
          _this.prepend(data);
      })
      .then(function () {
        $('.ovl').append(Ovl.wrapper.close);
      })
      .fail(function () {
      });
    }
  },

  close: function(){
    // Clean form's inputs
    if ($('.ovl-wrap').hasClass('ovl-form')) {
      $('.input-error').remove();
      $('.ovl-wrap').find('.error').removeClass('error');
    }

    Ovl.moveContentBack();

    // Remove wrapper
    $('.ovl-fade').remove();
    $('.ovl-wrap').remove();
    $('body').removeClass('ovl-opened');

    var eventName = new Event('ovlClosed');
    document.dispatchEvent(eventName);
  },

  // Move HTML back to hidden block
  moveContentBack: function(){
    if (Ovl.target != null) {
        $('.ovl > div').appendTo(Ovl.target);
        Ovl.target.find('.ovl-close.js-ovl-close').remove();
        Ovl.target = null;
    }
  },


    // content's variants (need to move here)
    video: function(videoid){
      $('.ovl').append('<div class="ovl-video"><iframe width="100%" height="100%" frameborder="0" allowfullscreen src="https://www.youtube.com/embed/' + videoid + '?rel=0&autoplay=1"></iframe></div>' + Ovl.wrapper.close)
    //  Ovl.resize();
    },
    resize: function(){
      var video_size = 0.8,
          win_width = $('.ovl-fade').width(),
          win_height = $('.ovl-fade').height(),
          cur_height = 0,
          cur_width = 0;

      if (win_height / 9 > win_width / 16) {
        cur_width = win_width * video_size;
        cur_height = Math.ceil((cur_width / 16) * 9);
      }
      else {
        cur_height = win_height * video_size;
        cur_width = Math.ceil((cur_height / 9) * 16);
      }

      $('.ovl-video').css('width', cur_width + 'px').css('height', cur_height + 'px');
    },

    //gallery navigation
    galleryNav: function(direction,type){
      console.log(Ovl.gallery.index);
      console.log(Ovl.gallery.max);
       switch (direction) {
         case 'prev':
           Ovl.gallery.index = (Ovl.gallery.index == 0) ? Ovl.gallery.max - 1 : Ovl.gallery.index - 1;
           break;
         case 'next':
          Ovl.gallery.index = (Ovl.gallery.index == (Ovl.gallery.max - 1)) ? 0 : Ovl.gallery.index + 1;
           break;
       }
       if(type=='custom') {
         $('.ovl img').attr('src', Ovl.gallery.elements+(Ovl.gallery.index+1)+'.jpg');
       } else {
         $('.ovl img').attr('src', Ovl.gallery.elements.eq(Ovl.gallery.index).attr('data-gallery-url'));
       }

    }

};

// default ovl call - click on link
$(document).on('click', '.js-ovl-open', function (event) {
  var form =  ($(this).attr('data-form')) ? true : false;
  Ovl.open('click', event.target, form);
});


 $(document).on('click', '.js-gallery-nav', function (event) {
   var direction = $(this).attr('data-direction');
   if(Ovl.gallery.set=='false') {
     Ovl.galleryNav(direction,'custom');

   } else {
     Ovl.galleryNav(direction);
   }
 });


// ovl close call on click
$(document).on('click', '.js-ovl-close', function (event) {
  Ovl.close();
});

// ovl close call on fade
$(document).on('click', '.ovl-wrap', function (event) {
  if (event.target == this) {
    if ($(this).hasClass('ovl-form')) {
        return false;
    }
    else {
      Ovl.close();
    }
  }
});

// ovl close call on esc
$(document).on('keyup', function (e) {
  if ($('body').hasClass('ovl-opened')) {
    switch (e.keyCode) {
      case 27:
          Ovl.close();
          break;
      case 39:
          Ovl.galleryNav('next');
        //  Ovl.close();

          break;
      case 37:
          Ovl.galleryNav('prev');
      //    Ovl.close();
          break;
    }
  }
});

// ovl with video resize on window resize
$(window).on('resize', function () {
  //  if ($('body').hasClass('ovl-opened') && $('.ovl-video').length)
    //    Ovl.resize();
});
