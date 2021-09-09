const socket = io()

/* document.querySelector('#messageButton').addEventListener('click',() =>{
    console.log('sent')
    socket.emit("sendMessage",document.getElementById("message").value)
}) */

const $messageForm  = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input') 
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector("#messages")
const $sendLocationButton = document.querySelector('#send-location')

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const { username , room } = Qs.parse(location.search,{ ignoreQueryPrefix:true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset =  $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
        console.log("hey")
    }
}

$messageForm.addEventListener('submit',(e) =>{
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled','disabled')
    socket.emit("sendMessage",e.target.elements.message.value,(status)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        console.log("message",status)
        
    })
})

socket.on('message',(message) => {
    //console.log(message)
    const html = Mustache.render(messageTemplate, {
        message : message.text,
        createdAt : moment(message.createdAt).format("h:mm a"),
        username : message.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('locationMessage',(message) => {
    //console.log(message)
    const html = Mustache.render(locationTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users    
    })
    document.querySelector("#sidebar").innerHTML =  html
})

$sendLocationButton.addEventListener('click',() =>{
    if(!navigator.geolocation){ 
        return alert("Geolocation is not supported on your browser")
    }    
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) =>{
        console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
             console.log("location shared")
             $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join' , { username , room} , (error) => {
    if(error){
        alert(error)
        location.href = '/' ;
    }
})

