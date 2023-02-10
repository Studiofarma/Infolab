var md = require("markdown-it")({
  highlight: function (str, lang, _) {
    return "";
  },
});

export var output = md.render("# ciao");
