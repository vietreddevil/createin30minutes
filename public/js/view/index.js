$(document).ready(function() {
    configview();
})

function configview() {
    var x = $('#demo-navbar').height() + 20;
    $('#container').css({'margin-top': x});
}