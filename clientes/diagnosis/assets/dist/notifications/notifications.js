
(function (){
	/* Esperar carga de objeto YEBOYEBO */
	function esperacarga(){
		if (YEBOYEBO){
			/*****************WEB PUSH NOTIFICATIONS************************/
			console.log("notificationsjs")
			var config = {
			  apiKey: "AIzaSyA8LXe9mZi_s3IAzEQSx6nVn4LsTjjnLos",
			  authDomain: "aqnextnotifications.firebaseapp.com",
			  databaseURL: "https://aqnextnotifications.firebaseio.com",
			  storageBucket: "aqnextnotifications.appspot.com",
			  messagingSenderId: "567361726387"
			};
			YEBOYEBO.firebase.initializeApp(config);
			registro();
		}
		else{
			window.setTimeout(esperacarga, 200);
		};

	};
	esperacarga();
})();

let swRegistration = null;

//--Comprueba si tiene token si no lo tiene pide permiso para crearlo.
function requestToken(){
	swRegistration.getToken()
		    .then(function(currentToken) {
		      if (currentToken) {
		      	sendTokenToServer(currentToken);
/*		      	console.log("Ya tengo token");
		        console.log(currentToken);*/
		      } else {
		        //Se necesita permiso para crear token
		        requestPermission();
		      }
		    })
		    .catch(function(err) {
/*		      window.alert("error inesperado");
		      window.alert(err)
		      console.log('Error inesperado ', err);*/
		      setTokenSentToServer(false);
		      //requestPermission();
		    });
}

//--Registra ser serviceWorker donde estara el escuchador de eventos.
function registro(){
	navigator.serviceWorker.register('/static/dist/notifications/sw.js')
	.then((registration) => {

		swRegistration = YEBOYEBO.firebase.messaging();
		swRegistration.useServiceWorker(registration);
		  requestToken();
	});
}

//---Pide permiso para crear token y pone a false el token registration
function requestPermission() {
	setTokenSentToServer(false);
    swRegistration.requestPermission()
    .then(function() {
      requestToken();
    })
    .catch(function(err) {
      console.log('No se aceptaron condiciones', err);
    });
}

function sendTokenToServer(currentToken) {
/*    setTokenSentToServer(false);*/
	if (!isTokenSentToServer()) {
		setTokenSentToServer(true);
		var url = "/token/"+currentToken;
		var xmlHttp = new XMLHttpRequest();
	    xmlHttp.open("GET", url, true); // true for asynchronous
	    xmlHttp.send(null);
	} else {
		return false;
	}

}

function isTokenSentToServer() {
	if (window.localStorage.getItem('sentToServer') == 1) {
	      return true;
	}
	return false;
}

//--Para almacenar token en servidor solo una vez
function setTokenSentToServer(sent) {
	if (sent) {
		window.localStorage.setItem('sentToServer', 1);
	} else {
		window.localStorage.setItem('sentToServer', 0);
	}
}

