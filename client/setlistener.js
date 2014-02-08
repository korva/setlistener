var Songs = new Meteor.Collection('songs', {connection: null});

Template.playlist.songs = function () {
  return Songs.find({}, {sort: {position: 1}});
};

Handlebars.registerHelper('search_populated',function(input){
  return Songs.find({}).count() != 0;
});

Handlebars.registerHelper('playlist_name',function(input){
  return Session.get("playlist_name");
});

Handlebars.registerHelper('playlist_created',function(input){
  return Session.get("playlist_created");
});

Handlebars.registerHelper('playlist_creation_failed',function(input){
  return Session.get("playlist_creation_failed");
});

Handlebars.registerHelper('app_link',function(input){
  return Session.get("app_link");
});

Handlebars.registerHelper('web_link',function(input){
  return Session.get("web_link");
});

Template.fetch.events({
  'click button' : function () {
      
    clearSession();
    Songs.find({}).forEach(function(doc){ Songs.remove({_id: doc._id}) });

    var input = $('#input-textarea').val().split("\n");
    $.each(input, function(index, line){
      line = line.replace(/^[0-9]+/, '').replace(/^[.]+/, ''); // remove list numbers
      if(line.length > 0) {
      $.get(
        "http://ws.spotify.com/search/1/track.json?q=" + line,
        function(data) {
          if(!data || !data.tracks || data.tracks.length == 0) {
            Songs.insert({
              artist: line,
              title: "(No track found)", 
              position: index
            }); 
          } else {      
            addSong(data.tracks[0], index, false);
          }
        }
      );
      }
    });    
  }
});

Template.generate.events({
  'click button' : function () {
      
    clearSession();  
    var uriArray = new Array();
      
    Songs.find({}).forEach(function(song){ 
      if(song.href) uriArray.push(song.href); 
    });

    var name = $('#name-input').val();
    if(!name) name = "Playlist" + Math.floor(Math.random()*10000);

    Meteor.call('generatePlaylist', name, uriArray, function (error, result) { 
      if(result && result.data && result.data.uri) { 
        Session.set("app_link", result.data.uri);
        Session.set("web_link", parseHttpLink(result.data.uri));
        Session.set("playlist_name", name);
        Session.set("playlist_created", true);
      }
      else {
        Session.set("playlist_creation_failed", true);
      } 
        
    });
  }
});

function clearSession() {
  Session.set("app_link", null);
  Session.set("web_link", null);
  Session.set("playlist_name", null);
  Session.set("playlist_created", false);
  Session.set("playlist_creation_failed", false);
}

function addSong(song, index) {  
  Songs.insert({
    title: song.name, 
    artist: song.artists[0].name, 
    href: song.href,
    player_link: formPlayerLink(song.href),
    position: index
  });
}

function formPlayerLink(href) {
  return "https://play.spotify.com/track/" + href.substring(14);
}

function parseHttpLink(uri) {
  var parts = uri.split(':');
  if(parts.length !== 5) return null;
  return "https://play.spotify.com/user/" + parts[2] + "/playlist/" + parts[4];
}