document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //var recipients = document.querySelector('#compose-recipients');
  //var subject = document.querySelector('#compose-subject');
  //var body = document.querySelector('#compose-body');

  document.querySelector('#compose-submit-btn').addEventListener('click', send_email);

  // By default, load the inbox
  //load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-overview').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-overview').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-overview').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  get_emails(mailbox)
}

function show_email(id){

  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-overview').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${id}`)
    .then(res => res.json())
    .then(res => {
      document.querySelector('#email-view').style.display = 'block';
      reply_button = document.createElement('button')
      reply_button.setAttribute('id', 'reply')
      reply_button.setAttribute('class', 'btn btn-primary')
      reply_button.setAttribute('onclick', `reply(${id})`);
      reply_button.innerHTML = 'Reply'
      document.querySelector('#email-view').innerHTML = `<p> Sent by: ${res.sender}</p>` +
       `<p> Subject: ${res.subject}</p>` + `<p> Time: ${res.timestamp}</p>` +
       `<p> Contents: ${res.body}</p>`;
      document.querySelector('#email-view').append(reply_button)

    })
    .catch(error => {
          console.log('Error:', error);

      });

   update_read(id)
}

function reply(id){

  document.querySelector('#emails-overview').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  fetch(`/emails/${id}`)
    .then(res => res.json())
    .then(res => {

      document.querySelector('#compose-recipients').value = `${res.sender}`;
      document.querySelector('#compose-body').value = `On ${res.timestamp}, ${res.sender} wrote: ${res.body}`;

    if (res.subject.includes("Re: ")) {
      document.querySelector('#compose-subject').value = `${res.subject}`;

    } else {
      document.querySelector('#compose-subject').value = `Re: ${res.subject}`;
    }
});

}

function update_read(id) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .then(res => res.json())
  .catch(error => {
    console.log('Error:', error);
  });
}

function archive(id) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(res => res.json())
  .catch(error => {
    console.log('Error:', error);
  });
}

function unarchive(id) {

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(res => res.json())
  .catch(error => {
    console.log('Error:', error);
  });
}

function send_email() {

    const recipients = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');

  const formdata = {
    recipients: recipients.value,
    subject: subject.value,
    body: body.value
  };

  const options = {
    method:'POST',
    body: JSON.stringify(formdata),
    headers: {
      'Content-Type': 'application/json'
    }
  }

    fetch('/emails', options)
      .then(res => res.json())
      .then(res => console.log(res))
      .catch(error => {
            console.log('Error:', error);

        });
  load_mailbox("sent");
}

function get_emails(mailbox) {

  fetch(`/emails/${mailbox}`)
    .then(res => res.json())
    .then(res => {

      for (var item in res) {

        const div = document.createElement('div');
        const button = document.createElement('button')
        var count = 0;

        if (res[item].read == true) {
          div.classList.add('read');
        } else {
          div.classList.add('unread');
        }

        div.innerHTML = '<li>' + "<a href='#'>"  + `  ${res[item].subject}` + `   ${res[item].timestamp}` + '</a>' + '</li>'
        div.setAttribute('onclick', `show_email(${res[item].id})`);
        button.setAttribute('type', 'submit')
        button.setAttribute('class', 'btn btn-primary')

        if (res[item].archived == true) {
          button.innerHTML = "Unarchive"
          button.setAttribute('onclick', `unarchive(${res[item].id})`);
        } else {
          button.innerHTML = "Archive"
          button.setAttribute('onclick', `archive(${res[item].id})`)
          }
        document.querySelector('#emails-overview').append(div)
        document.querySelector('#emails-overview').append(button)

      }
      console.log(res)
    })
    .catch(error => {
          console.log('Error:', error);
      });
  }
