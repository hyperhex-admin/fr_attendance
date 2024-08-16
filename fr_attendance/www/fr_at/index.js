$(document).ready(function () { /* code here */
    document.getElementById('wait_div').style.visibility = 'hidden';
    // document.getElementById('itakeASnap').style.visibility = "hidden";
    // document.getElementById('pro_btn').style.visibility = "hidden";
    getDevice();
    getLocation();
    user_location();

    ivideo();
    
});

const locateCurrentPosition = () => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
        position => {
            console.log(position.coords.latitude, position.coords.longitude);
            loc = (position.coords.latitude, position.coords.longitude);
            document.getElementById("location").value = (position.coords.latitude + ", " + position.coords.longitude);
            resolve(loc);
            return loc;
        },
        error => {
            console.log(error.message);
            document.getElementById("location").value = "error, " + error.message
            reject(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000
        }
    );
});

function ivideo() {
    // if (document.getElementById("end_aadhar").value == ""){
    //     alert("Please Enter Aadhar Number")
    //     return
    // } 
    // if(document.getElementById("end_pan").value == ""){
    //     alert("Please Enter PAN Number")
    //     return
    // }
    
    // document.getElementById('iivideo').style.visibility = 'hidden';
    // document.getElementById('itakeASnap').style.visibility = "visible";
    const vid = document.querySelector('video');
    vid.setAttribute("id", "video_capture");
    navigator.mediaDevices.getUserMedia({ video: true }) // request cam
        .then(stream => {
            vid.srcObject = stream; // don't use createObjectURL(MediaStream)
            vid.width = 320;
            return vid.play(); // returns a Promise  
        })
        .then(() => { // enable the button
            const btn = document.querySelector('capture');
            btn.disabled = false;
            btn.onclick = e => {
                takeASnap()
                    .then();
            };
        });
}

function takeASnap() {

    const vid = document.querySelector('video');
    const canvas = document.createElement('canvas'); // create a canvas
    const ctx = canvas.getContext('2d'); // get its context
    canvas.width = vid.videoWidth; // set its size to the one of the video
    canvas.height = vid.videoHeight;
    ctx.drawImage(vid, 0, 0); // the video
    return new Promise((res, rej) => {
        canvas.toBlob(res, 'image/jpeg') // request a Blob from the canvas
    });
}
function download(check_in_out) {
    document.getElementById('checkin').style.visibility = 'hidden';
    document.getElementById('checkout').style.visibility = 'hidden';
    document.getElementById('wait_div').style.visibility = 'visible';

    takeASnap().then(blob => {
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            var base64data = reader.result;
            console.log(base64data);

            frappe.call({
                method: 'fr_attendance.api.store_image',
                args: {
                    'emp_id': document.getElementById("emp_id").value,
                    'image': base64data,
                    'device_name':document.getElementById("device_name").value,
                    'ip_address':document.getElementById("ip_address").value,
                    'location':document.getElementById("location").value,
                    'type': check_in_out
                    
                },
                freeze: true,
                freeze_message: "Please Wait...",
                callback: function(res) {
                    if (!res.exc) {
                        // code snippet
                        const vid = document.querySelector('video');
                        vid.pause();
                        if(res.message == false){
                            alert("Face didn't Match / Already Checked in or Checked out!");
                            window.location.reload();
                        }else if(res.message == true){
                            alert("Record stored successfully!")
                            window.location.reload();
                        }
                    }
                }
            });
            
            // frappe.call('fr_attendance.api.store_image',  {
            //     emp_id: document.getElementById("emp_id").value,
            //     image: base64data,
            //     device_name:document.getElementById("device_name").value,
            //     ip_address:document.getElementById("ip_address").value,
            //     location:document.getElementById("location").value,
            //     type: check_in_out

            // }).then(res => {
            //     // document.getElementById('itakeASnap').style.visibility = "hidden";
            //     // document.getElementById('video_capture').style.visibility = "hidden";
            //     const vid = document.querySelector('video');
            //     vid.pause();
            //     if(res.message == false){
            //         alert("Face didn't Match / Already Checked in or Checked out!");
            //         window.location.reload();
            //     }else if(res.message == true){
            //         alert("Record stored successfully!")
            //         window.location.reload();
            //     }
            //     // geteSignData();
            // });
        }
    })

}

function geteSignData(){
    frappe.call('esign.api.get_esign_information', {
        application_id: document.getElementById("application_id").value
    }).then(res => {    
        document.getElementById("saCode").value = res.message[0]
        document.getElementById("requestId").value = res.message[1]
        document.getElementById("timeStamp").value = res.message[2]
        document.getElementById("esignName").value = res.message[3]
        document.getElementById("hash").value = res.message[4]
        document.getElementById("successUrl").value = res.message[5]
        document.getElementById("failureUrl").value = res.message[6]

        document.getElementById('pro_btn').style.visibility = "visible";
    });
 
}

function getDevice() {
    const getUA = () => {
        let device = "Unknown";
        const ua = {
            "Generic Linux": /Linux/i,
            "Android": /Android/i,
            "BlackBerry": /BlackBerry/i,
            "Bluebird": /EF500/i,
            "Chrome OS": /CrOS/i,
            "Datalogic": /DL-AXIS/i,
            "Honeywell": /CT50/i,
            "iPad": /iPad/i,
            "iPhone": /iPhone/i,
            "iPod": /iPod/i,
            "macOS": /Macintosh/i,
            "Windows": /IEMobile|Windows/i,
            "Zebra": /TC70|TC55/i,
        }
        Object.keys(ua).map(v => navigator.userAgent.match(ua[v]) && (device = v));
        return device;
    }
    document.getElementById("device_name").value = getUA() + " / " + navigator.userAgent;
    if (document.getElementById("device_name").value != "") {
        // document.getElementById('get_device_id').style.visibility = 'hidden';

        // frappe.call('esign.api.store_device_track', {
        //     application_id: document.getElementById("application_id").value,
        //     device: (getUA() + " / " + navigator.userAgent)
        // }).then(res => {
        //     // this.submit_btn.remove()
        //     if (!res.message) {
        //         frappe.throw(__("Something went wrong while finding the Device Name."))
        //     }
        // });
    }

}

function getLocation() {
    if (navigator.geolocation) {
        position = locateCurrentPosition().then(res => {
            if (document.getElementById("location").value != "") {
                // document.getElementById('get_location').style.visibility = 'hidden';
                // frappe.call('esign.api.store_device_track', {
                //     application_id: document.getElementById("application_id").value,
                //     location: document.getElementById("location").value
                // }).then(res => {
                //     // this.submit_btn.remove()
                //     if (!res.message) {
                //         frappe.throw(__("Something went wrong while finding the Device Name."))
                //     }
                // });
            }
            user_location()
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    return "Lat: " + position.coords.latitude +
        "<br>Long: " + position.coords.longitude;
}

function user_location() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("ip_address").value = this.responseText
            // frappe.call('esign.api.store_device_track', {
            //     application_id: document.getElementById("application_id").value,
            //     ip: this.responseText
            // }).then(res => {
            //     // this.submit_btn.remove()
            //     if (!res.message) {
            //         frappe.throw(__("Something went wrong while finding the Device Name."))
            //     }
            // });
            console.log(this.responseText);
        }
    };
    xhttp.open("GET", "//api.ipify.org?format=text", true);
    xhttp.send();
}




var width = 320; // We will scale the photo width to this
var height = 0; // This will be computed based on the input stream
var streaming = false;
var video = null;
var canvas = null;
var photo = null;
var startbutton = null;

function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('btn_cap_img');

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });

    video.addEventListener('canplay', function (ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);

            if (isNaN(height)) {
                height = width / (4 / 3);
            }

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    startbutton.addEventListener('click', function (ev) {
        takepicture();
        ev.preventDefault();
    }, false);

    clearphoto();
}


function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
}

function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    } else {
        clearphoto();
    }
}

document.getElementById('btn_cap_img').addEventListener('click', function (ev) {
    takepicture();
    ev.preventDefault();
}, false);