document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(event, id) {
  clearCform();
  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (id != undefined) {
    fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
        document.querySelector('#compose-recipients').value = email.sender;
        var str = email.subject;
        var re = str.includes('re:');
        if (re == true) {
          document.querySelector('#compose-subject').value = email.subject;
        } else {
          document.querySelector('#compose-subject').value = 're: ' + email.subject;
        }
        document.querySelector('#compose-body').value = `Reply: \n\n\n On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
  }

  document.querySelector('#compose-form').addEventListener('submit', function (e) {
    e.preventDefault();

    let r = document.querySelector('#compose-recipients').value;
    let s = document.querySelector('#compose-subject').value;
    let b = document.querySelector('#compose-body').value;
    cform(r, s, b);
    clearCform();
  });
}

// Clear out composition fields
function clearCform() {
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
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
        // alert(result.message);
        load_mailbox('sent');
      } else {
        alert(result.error);
        compose_email();
      }
    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // fetch emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // console.log(emails);

      if (emails != '') {

        var result = '';
        result += `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><br />`;

        emails.forEach(email => {
          let str = email.body;
          if (str.length > 10) {
            body = str.slice(0, 10) + ' .......';
          } else {
            body = str;
          }

          result += `<div class="row mb-4">`
          if (email.read == true) {
            result += `<div class="col-8" style="word-wrap:break-word; background-color:rgb(184, 181, 181); color:white;">`
          } else {
            result += `<div class="col-8" style="word-wrap:break-word; background-color:white; color:white;">`
          }
          result += `<a style="color:black;" onclick="load_mail(${email.id})" href="#"> <h4>${email.sender}</h4> <div><b>SUBJECT:</b> <i>${email.subject}</i></div> <div><b>MESSAGE:</b> ${body}</div> </a> </div>`
          result += `<div class="col-4"> <div style="margin:1rem;">${email.timestamp}</div>`
          if (mailbox != 'sent') {
            result += `<div> <center> <span onclick="reply(${email.id})" class="btn-sm btn-success" style="cursor: pointer">reply</span>&nbsp;&nbsp;&nbsp;`
            if (email.archived == false) {
              result += `<span onclick="archive(${email.id})" class="btn-sm btn-primary" style="cursor: pointer">archive</span> </center> </div> </div> </div>`
            } else {
              result += `<span onclick="unarchive(${email.id})" class="btn-sm btn-primary" style="cursor: pointer">unarchive</span> </center> </div> </div> </div>`
            }
          } else {
            result += `</div> </div>`;
          }
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

  // Show the mail and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // fetch email
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // console.log(email);

      result = `<div class="row mb-4"> <div style="border:1px solid; word-wrap:break-word;" class="col-12">`;

      result += `<div><b>From:</b> ${email.sender}</div>`;
      result += `<div class=""><b>To:</b> ${email.recipients}</div>`;
      result += `<div class=""><b>Subject:</b> ${email.subject}</div>`;
      result += `<div>${email.timestamp}</div>`;
      if (email.archived == false) {
        result += `<div class=""><span onclick="reply(${email.id}, ${email.id})" class="btn-sm btn-primary" style="cursor: pointer;">reply</span> <span onclick="archive(${email.id})" class="btn-sm btn-success ml-auto" style="cursor: pointer;">archive</span></div><hr />`;
      } else {
        result += `<div class=""><span onclick="unarchive(${email.id})" class="btn-sm btn-success ml-auto" style="cursor: pointer;">unarchive</span></div><hr />`;
      }
      result += `<div class="" style="">${email.body}</div>`;
      result += ``;

      result += '</div> </div>';

      document.querySelector('#email-view').innerHTML = result;

      fetch('/emails/' + email.id, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
    });
}

function reply(event, id) {
  compose_email(event, id);
}

function archive(id) {
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
    .then(data => {
      // alert("archived!");
      window.location = '';
    });
}

function unarchive(id) {
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
    .then(data => {
      // alert("unarchived!");
      window.location = '';
    });
}