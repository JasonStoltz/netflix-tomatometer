(function($) {
  $.getScript("//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js", function(){

      var tomatometer = '<b>Tomatometer:</b>&nbsp;<span style="' +
            'display: inline-block; width: 55px; padding-bottom: 1px;' +
        '"><span style="' +
            'background: transparent url(\'http://images.rottentomatoescdn.com/images/redesign/icons-v2.png?v=20120910\') no-repeat -312px -160px;' +
            'display: inline-block; vertical-align: text-bottom;' +
            'width: 16px; height: 16px;' +
            'background-position: -272px -144px;' +
        '"></span>' +
        '<span style="' +
            'display: inline-block; width: 31px; text-align: center;' +
        '">{1}%</span></span>';

      var currentTitle;

      setInterval(function() {

        var $movieContent = $('#BobMovie-content');
        var title = $movieContent.find('span.title').html();

        if (title == currentTitle) {
          return;
        }

        currentTitle = title;

        var year = $movieContent.find('span.year').html();
        var $actors = $movieContent.find('a[href*="WiRoleDisplay"]');
        var actors = [];
        _.each($actors, function(e){actors.push($(e).html())});

        $.ajax({
          url: "http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=84vwsh3zsrqkv6atthsuq66a&q=" + title,
          dataType : "jsonp",
          context: document.body
        }).done(function(response) {
              var narrowed = response.movies;
              //Lets see if the dates match exactly on either side of the boundary
              _.each(year.split('-'), function(e){
                var temp = _.where(response.movies, {'year': parseInt(e)});

                if (temp.length < narrowed.length && temp.length > 0) {
                  narrowed = temp;
                }
              });              
              
              if (narrowed.length == 1) {
                  var rating = narrowed[0].ratings.audience_score;
              }

              //Let's see if we have an exact mathc on the title
              var temp = _.where(narrowed, {'title': title});
              if (temp.length < narrowed.length && temp.length > 0) {
                narrowed = temp;
              }

              if (narrowed.length == 1) {
               var rating = narrowed[0].ratings.audience_score;
              }

              if (narrowed.length > 1) var rating = narrowed[0].ratings.audience_score;

              var $infodiv = $movieContent.find('div.info');
              $infodiv.append($(tomatometer.replace('{1}', rating)));

        });

      }, 100);

  });

  
})(jQuery);