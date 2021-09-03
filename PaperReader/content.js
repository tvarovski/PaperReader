function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
};

let papragraphs = document.getElementsByTagName("p");
var pageText = "";

for (elt of papragraphs) {
    
    pageText += (elt.textContent + " ");
    //elt.textContent = elt.textContent.replaceAll("Large", "Humongous");
};

let re = new RegExp(/\([^\s\d\(\)]{2,10}\)/, "g");
var brackets = pageText.match(re).filter(onlyUnique);

var terms = [];

for (str of brackets) {
    //console.log(str);
    str = str.replace(/\(|\)/g, "");

    if (/[A-Z]/.test(str)) {
        terms.push(str)
    }
};

for (term of terms) {
    console.log(term);
    var term_index = pageText.indexOf("("+term+")");
    var term_context = pageText.substring(term_index-50, term_index-1);
    //console.log(term_context);

    $('p').each(function() {
        var html = $(this).html()
        $(this).html(html.replaceAll(term, '<b data-bs-toggle="tooltip" title="(...)'+term_context+'...">'+term+'</b>'))
    })

};

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
});

console.log("Fin!");
