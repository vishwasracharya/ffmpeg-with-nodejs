function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const formats = ["AVI", "MP4", "FLV", "GIF", "MOV", "MPEG", "SWF", "VOB", "WEBM", "FLAC", "MP2", "MP3", "OGG", "OPUS", "WAV"];
const uploadFileBtn = document.getElementById('uploadFileBtn');
const chooseFile = document.getElementById('chooseFile');
let file = {}
// Checks Whether the file Choosen is valid or not.
function checkInputFileFormat() {
    file = chooseFile.files[0];
    // if the file size is more that or equal 100MB then show error message.
    if (file.size >= 100000000) {
        document.getElementById('formatErrMsg').innerHTML = "File size is too large. Please upload a file less than 100MB.";
        document.getElementById('formatErrMsg').classList.remove('d-none');
        uploadFileBtn.disabled = true;
        return;
    }
    if (formats.includes(file.name.split('.').pop().toUpperCase())) {
        uploadFileBtn.disabled = false;
        document.getElementById('formatErrMsg').classList.add('d-none');
        // console.log('File format is supported');
    } else {
        chooseFile.value = '';
        document.getElementById('formatErrMsg').classList.remove('d-none');
    }
}
uploadFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Checks Any File is Chose or Not
    if (chooseFile.value == '') {
        chooseFile.focus();
        chooseFile.classList.add('is-invalid');
        chooseFile.classList.remove('is-valid');
        chooseFile.placeholder = 'Please select a file';
    } else {
        chooseFile.classList.remove('is-invalid');
        chooseFile.classList.add('is-valid');
        chooseFile.placeholder = 'Choose a file';
        checkInputFileFormat();
        if (document.getElementById('formatErrMsg').classList.contains('d-none')) {
            uploadFileBtn.disabled = false;
        }

        let outputFilename = `${file.name.split(" ").join("-").split(".")[0].toLowerCase()}.${document.getElementById('convertTo').value.toLowerCase()}`;
        // console.log(outputFilename);
        let formData = new FormData();
        formData.append('file', file);
        formData.append('to', document.getElementById('convertTo').value.toLowerCase());
        uploadFileBtn.innerHTML = `<div class="spinner-border spinner-border-sm text-dark me-3" role="status"></div>Processing...`;

        document.cookie = `psvcatoken=${outputFilename.split(".").join("-")}`;
        // Uploads File to Server and Converts it to Output Format
        fetch(`/convertOriginalFile`, {
            method: 'POST',
            body: formData,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Authorization": `Bearer ${getCookie('psvcatoken')}`,
                'to': document.getElementById('convertTo').value.toLowerCase(),
            }
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.error) {
                    console.log("Error");
                    uploadFileBtn.innerHTML = `Upload & Convert`;
                    document.getElementById('errMsg').classList.remove('d-none');
                    document.getElementById('errMsg').innerText = data.message;
                }
                if (data.ok) {
                    document.getElementById('FileSeletionForm').classList.add('d-none');
                    document.getElementById('successMsg').classList.remove('d-none');

                    // Downloads File from Server
                    let downloadBtn = document.getElementById("downloadBtn");
                    downloadBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        fetch(`/downloadDeleteConvertedFile`, {
                            method: 'POST',
                            body: JSON.stringify({
                                filename: outputFilename,
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": `Bearer ${getCookie('psvcatoken')}`,
                            }
                        })
                            .then(async response => {
                                if (response.headers.get('content-type').includes('application/json')) {
                                    // console.log(response.headers.get('content-type'));
                                    const data = await response.json();
                                    console.log(data);
                                    if (data.status == 404) {
                                        downloadBtn.classList.remove("btn-dark");
                                        downloadBtn.classList.add("btn-danger");
                                        downloadBtn.innerText = data.message;
                                        downloadBtn.disabled = true;
                                    }
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 5000);
                                } else {
                                    // console.log(response.headers.get('content-type'));
                                    const blob = await response.blob();
                                    let url = window.URL.createObjectURL(blob);
                                    let a = document.createElement('a');
                                    a.href = url;
                                    a.download = outputFilename;
                                    a.click();
                                    downloadBtn.disabled = true;
                                }
                            })
                            .catch(err => {
                                console.log("Main Error");
                                console.log(err)
                            });
                    });
                } else {
                    console.log("Error");
                    uploadFileBtn.innerHTML = `Upload & Convert`;
                    document.getElementById('errMsg').classList.remove('d-none');
                    document.getElementById('errMsg').innerText = data.message;
                    uploadFileBtn.disabled = true;
                }
            })
            .catch(err => {
                console.log("Main Error Outside");
                console.log(err);
                uploadFileBtn.innerHTML = `Upload & Convert`;
                uploadFileBtn.disabled = true;
            });
    }
});