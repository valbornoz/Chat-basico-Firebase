const botones = document.querySelector('#botones')  //contenedor con ambos botones
const nombreUsuario = document.querySelector('#nombreUsuario')
const contenidoProtegido = document.querySelector('#contenidoProtegido')
const formulario = document.querySelector('#formulario')
const inputChat = document.querySelector('#inputChat')

firebase.auth().onAuthStateChanged( user => {
    if(user) {
        console.log(user)
        botones.innerHTML = /*html*/`
            <button class="btn btn-outline-danger" id='btnCerrarSesion'>Cerrar Sesión</button>
        `
        nombreUsuario.innerHTML = user.displayName
        cerrarSesion()
        
        formulario.classList="input-group py-3 fixed-bottom container"
        contenidoChat(user)
    }else{
        console.log('No existe user')
        botones.innerHTML = /*html*/`
            <button class="btn btn-outline-success mr-2" id='btnAcceder'>Acceder</button>
        `
        iniciarSesion()
        nombreUsuario.innerHTML = 'Chat'
        contenidoProtegido.innerHTML= /*html*/`
            <p class="text-center lead mt-5">Debes iniciar sesión</p>
        `
        formulario.classList="input-group py-3 fixed-bottom container d-none"
    }
})

const contenidoChat = (user) => {

    formulario.addEventListener('submit', (e) => {
        e.preventDefault()
        console.log(inputChat.value)

        if(!inputChat.value.trim()){
            console.log('input vacio')
            return
        }

        firebase.firestore().collection('chat').add({
            texto: inputChat.value,
            uid: user.uid,
            fecha: Date.now() //Guarda el momento en que el cliente presiona 'Enviar'
        })
        .then(res => { console.log('Mensaje guardado') })
        .catch(e => { console.log(e) })

        inputChat.value = ''
    })

    firebase.firestore().collection('chat').orderBy('fecha')
        .onSnapshot( query => {

            contenidoProtegido.innerHTML = '' //onSnapshot es un observador
            query.forEach(doc => {
                console.log(doc.data())
                if(doc.data().uid === user.uid){
                    contenidoProtegido.innerHTML += /*html*/`
                        <div class="d-flex justify-content-end">
                            <span class="badge badge-pill badge-primary">${doc.data().texto}</span>
                        </div>
                    `
                }else{
                    contenidoProtegido.innerHTML += /*html*/`
                        <div class="d-flex justify-content-start">
                            <span class="badge badge-pill badge-secondary">${doc.data().texto}</span>
                        </div>
                    `
                }
                contenidoProtegido.scrollTop = contenidoProtegido.scrollHeight
            });

        })
}

const iniciarSesion = () => {
    const btnAcceder = document.querySelector('#btnAcceder')
    btnAcceder.addEventListener('click', async () => {
        console.log('Me diste Click en Acceder')
        try {
            const provider = new firebase.auth.GoogleAuthProvider()
            await firebase.auth().signInWithPopup(provider)

        }catch (error) {
            console.error(error)
        }
    })
}

const cerrarSesion = () => {
    const btnCerrarSesion = document.querySelector('#btnCerrarSesion')
    btnCerrarSesion.addEventListener('click', () => {
        firebase.auth().signOut()
    })
}