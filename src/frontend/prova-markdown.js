var md = require('markdown-it')( {
  highlight: function (str, lang, _) {
    
    if( lang && highlightJS.getLanguage(lang)) 
      return '';

  }  
})

export var output = md.render('# WELCOME BACK')
