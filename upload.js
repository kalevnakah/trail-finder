const url = 'upload.php';
const form = document.querySelector('form');

// Upload files to the server
async function upload(e) {
  e.preventDefault();

  // Gather files and begin FormData
  const files = document.querySelector('[type=file]').files;
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    formData.append('files[]', file);
    console.log(file);
  }
  await fetch(url, {
    method: 'POST',
    body: formData,
  }).then((response) => {
    //console.log(response);
  });
}

form.addEventListener('submit', upload);
