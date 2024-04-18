// Obtiene la referencia del elemento textarea en el HTML
let postvalue = document.getElementById("textarea");

// Obtiene referencias a elementos HTML relevantes para mostrar el progreso de carga
var progressDiv = document.getElementById("progressdiv");
var progressbar = document.getElementById("progressbar");
var done = document.getElementById("done");

// Variable para almacenar el usuario actual
let currentuser = "";

// Variables para almacenar información sobre el archivo cargado
let url = "";
let fileType = "";

// Variable para almacenar el ID del usuario autenticado
let uid;

// Array para almacenar todos los usuarios
let alluser = [];

// Elemento HTML para mostrar la imagen del usuario
let userimg = document.getElementById("userimg");

// Evento que se activa cuando el estado de autenticación cambia (iniciar sesión, cerrar sesión, etc.)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Si el usuario está autenticado y su correo electrónico está verificado
        if (user.emailVerified) {
            uid = user.uid; // Obtiene el ID del usuario
            console.log("Email is verified!"); // Mensaje de registro en la consola
        } else {
            window.location.assign("./email.html"); // Redirecciona a la página de verificación de correo electrónico
        }
    } else {
        window.location.assign("./login.html"); // Redirecciona a la página de inicio de sesión si no hay usuario autenticado
    }
});

// Evento que se activa cuando el estado de autenticación cambia
firebase.auth().onAuthStateChanged((user) => {
    currentuser = user; // Almacena el usuario actual
});

// Función para cargar imágenes
let uploadimg = (event) => {
    fileType = event.target.files[0].type; // Obtiene el tipo de archivo
    // Sube el archivo al almacenamiento de Firebase
    var uploadfile = firebase
        .storage()
        .ref()
        .child(`postFiles/${event.target.files[0].name}`)
        .put(event.target.files[0]);
    uploadfile.on(
        "state_changed",
        (snapshot) => {
            // Calcula el progreso de carga y lo muestra
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            var uploadpercentage = Math.round(progress);
            console.log(uploadpercentage);
            progressDiv.style.display = "block";
            progressbar.style.width = `${uploadpercentage}%`;
            progressbar.innerHTML = `${uploadpercentage}%`;
        },
        (error) => { },
        () => {
            // Cuando la carga se completa, obtiene la URL de descarga del archivo
            uploadfile.snapshot.ref.getDownloadURL().then((downloadURL) => {
                url = downloadURL; // Almacena la URL de descarga
                done.style.display = "block"; // Muestra el mensaje de carga completada
                progressDiv.style.display = "none"; // Oculta el progreso de carga
            });
        }
    );
};

// Obtiene la fecha actual formateada
var d = new Date().toLocaleDateString();

// Función para crear una publicación
function createpost() {
    // Verifica que el texto de la publicación o la URL del archivo no estén vacíos
    if (postvalue.value !== "" || url !== "") {
        // Agrega la publicación a la colección "posts" en Firestore
        firebase
            .firestore()
            .collection("posts")
            .add({
                postvalue: postvalue.value, // Contenido de la publicación
                uid: currentuser.uid, // ID del usuario que realiza la publicación
                url: url, // URL del archivo cargado
                filetype: fileType, // Tipo de archivo cargado
                like: [], // Array para almacenar los "me gusta"
                dislikes: [], // Array para almacenar los "no me gusta"
                comments: [], // Array para almacenar los comentarios
                Date: `${d}` // Fecha de la publicación
            })
            .then((res) => {
                // Después de agregar la publicación, actualiza el documento con su ID
                firebase
                    .firestore()
                    .collection("posts/")
                    .doc(res.id)
                    .update({
                        id: res.id
                    })
                    .then(() => {
                        done.style.display = "none"; // Oculta el mensaje de carga completada
                        document.getElementById("uploadedmssage").style.display = "block"; // Muestra el mensaje de publicación exitosa
                        setTimeout(() => {
                            location.reload(); // Recarga la página después de un breve retraso
                        }, 2000);
                    });
            });
    }
}

// Función para cerrar sesión
const logout = () => {
    firebase.auth().signOut().then(() => {
        window.location.assign("./login.js"); // Redirecciona a la página de inicio de sesión
    });
};
