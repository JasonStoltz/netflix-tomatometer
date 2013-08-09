(function($, console, _) {

  'use strict';

  $.getScript("//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js", function(_){

      var tomatometer = _.template('<b>Tomatometer:</b>&nbsp;<span style="' +
            'display: inline-block; width: 55px; padding-bottom: 1px;' +
        '"><span style="' +
            'background: transparent url(\'http://images.rottentomatoescdn.com/images/redesign/icons-v2.png?v=20120910\') no-repeat -312px -160px;' +
            'display: inline-block; vertical-align: text-bottom;' +
            'width: 16px; height: 16px;' +
            'background-position: <%= freshness %>;' +
        '"></span>' +
        '<span style="' +
            'display: inline-block; width: 31px; text-align: center;' +
        '"><%= rating %>%</span></span>');
      var fresh = '-256px -144px;';
      var rotten = '-272px -144px';

      var currentTitle;

      setInterval(function() {

        var $movieContent = $('#BobMovie-content');
        var title = $movieContent.find('span.title').html();

        if (title === currentTitle) {
          return;
        }

        currentTitle = title;

        var year = $movieContent.find('span.year').html();
        var $actors = $movieContent.find('a[href*="WiRoleDisplay"]');
        var actors = [];
        _.each($actors, function(e){actors.push($(e).html());});

        $.ajax({
          url: "http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=84vwsh3zsrqkv6atthsuq66a&q=" + title,
          dataType : "jsonp",
          context: document.body
        }).done(function(response) {
          var movie = locateMovie(response.movies, year, title, actors);
          var rating = movie.ratings.audience_score;
          
          var $infodiv = $movieContent.find('div.info');
          var freshness = (rating > 49) ? fresh : rotten;
          $infodiv.append($(tomatometer({freshness: freshness, rating: rating})));
        });
      }, 100);



  });



  function locateMovie(movies, year, title) {
    if (movies.length === 1) {
      console.log('One movie, shortcircuiting');
      return movies[0];
    }

    var narrowed = movies;
            
    //Lets see if the dates match exactly on either side of the boundary
    //Dates may be in the format 2005-2009 so we check both boundaries
    _.each(year.split('-'), function(e){
      var temp = _.where(movies, {'year': parseInt(e, 10)});

      if (temp.length < narrowed.length && temp.length > 0) {
        narrowed = temp;
      }
    });              
    
    if (narrowed.length === 1) {
      console.log('Exact match on year out of an original ' + movies.length);
      return narrowed[0];
    }

    //Let's see if we have an exact mathc on the title
    var temp = _.where(narrowed, {'title': title});
    if (temp.length < narrowed.length && temp.length > 0) {
      narrowed = temp;
    }
    if (narrowed.length === 1) {
      console.log('Exact match on title out of an original ' + movies.length);
      return narrowed[0];
    }

    console.log('no match, still had ' + narrowed.length + ' out an original ' + movies.length);
    return narrowed[0];
  }

  
})(window.jQuery,
        window.console || {log:function(){}},
        window._);