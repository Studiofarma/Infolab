/*
Questo script serve a prendere il csrf token automaticamente per la chiamata all'api POST PostPrivateRoom.
Nella variabile authorizationHash ci va l'hash delle credenziali necessarie per l'autenticazione.
Quello qui presente è il corrispondente di user1 - password1.
L'hash si può trovare negli header della richiesta di Postman, con chiave Authorization.
*/

var csrfRequest = pm.request.clone();
csrfRequest.method = 'GET'
var authorizationHash = 'Basic dXNlcjE6cGFzc3dvcmQx'; // Header Authorization
csrfRequest.headers.add({
    key: 'Authorization',
    value: authorizationHash
});

csrfRequest.url = "http://localhost:8081/csrf"

pm.sendRequest(csrfRequest, function(err, res) {
    if (err) {
        console.log(err);
    } else {
        var csrfToken = res.json().token;
        if (csrfToken) {
            console.log('csrfToken fetched:' + csrfToken);
            postman.setEnvironmentVariable("csrf-token", csrfToken);
        } else {
            console.log('No csrf token fetched');
        }
    }
});