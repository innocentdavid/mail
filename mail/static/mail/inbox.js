document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-form').addEventListener('submit', function (e) {
    e.preventDefault();

    let r = document.querySelector('#compose-recipients').value;
    let s = document.querySelector('#compose-subject').value;
    let b = document.querySelector('#compose-body').value;
    cform(r, s, b);
    clearCform();
  });

  // Clear out composition fields
  clearCform();

  function clearCform() {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
}


function cform(r, s, b) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: r,
      subject: s,
      body: b
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      // console.log(result);
      if (result.message) {
        alert(result.message);
        window.location = '';
      }
      else {
        alert(result.error);
        window.location = '';
      }
    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // fetch emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      if (emails != '') {

        var result = '';
        result += `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><br />`;

        emails.forEach(email => {
          let str = email.body;
          body = str.slice(0, 100) + ' .......';

          result += `<div class="row mb-4"> <div class="col-9"> <a onclick="load_mail(${email.id})" href="#" id="singleEmail"> <h4>${email.sender}</h4> <div><b>SUBJECT:</b> <i>${email.subject}</i></div> <div><b>MESSAGE:</b> ${body}</div> </div></a>`
          result += `<div class="col-3"> <div style="margin:1rem;">${email.timestamp}</div> <div> <center> <span onclick="alert('reply')" class="btn btn-success">reply</span> <span onclick="alert('archieve')" class="btn btn-primary">achieve</span> </center> </div> </div> </div>`
        });

        document.querySelector('#emails-view').innerHTML = result;

      } else {
        var result = '';
        result += `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><br />`;
        result += '<ul><li>No emails</li></ul>'

        document.querySelector('#emails-view').innerHTML = result;

      }
    });
}

function load_mail(id) {

  // fetch email
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      // emails.forEach(email => {
      //   console.log(email.sender);
      // });
    });
}