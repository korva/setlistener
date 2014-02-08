Meteor.startup(function() {

  return Meteor.methods({

    generatePlaylist: function(playlistName, uriArray) {

      var playlist = HTTP.call("POST", "http://localhost:1337/playlist",
                           {data: {title: playlistName}});

      console.log(playlist);
      if(!playlist.data.uri) return null;

      var uri = "http://localhost:1337/playlist/" + playlist.data.uri + "/add";
      console.log(uri);

      var request = formArrayString(uriArray);
      console.log(request);

      var result = HTTP.call("POST", uri, {content: request});

      return result;

    }

  });

});

function formArrayString(array) {
  if(array.length === 0) return "[]";
  var result = "[\"";
  for(i = 0 ; i < array.length ; i++) {
    result += array[i] + "\",\"";
  }
  result = result.slice(0, -2)
  result += "]";
  return result;

}