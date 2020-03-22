import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const template = document.createElement("template");
template.innerHTML = `
<style>
:host * {
  box-sizing: border-box;
  font-family: Helvetica, Arial, Sans-serif;
}
.container{
  display: flex;
  flex-direction: column;
  padding: 2rem;
  margin: 0;
  background-color: #eeeeee;
}

.window{
  height:100%;
  display: flex;
  flex-direction:column;
  overflow-y: auto;
  background-color: #ffffff;
  padding: .5rem;
}
.bot-msg, .client-msg {
  background-color: #eee;
  max-width: 75%;
  padding: .5rem;
}
.bot-msg{
  align-self: flex-start;
}
.client-msg{
  text-align: right;
  align-self: flex-end;
}
.msg-input {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 1rem 0 0;
}
.msg-input input {
  flex-grow: 1;
  padding: .25rem .5rem;
  border: solid 1px #ddd;
}
button {
  background-color: #ffffff;
  padding: 0.5rem 0.5rem 0.25rem;
  border: solid 1px #ddd;
  margin-left: .25rem;
}

</style>
<div class="container">
<div class="window"></div>
  <div class="msg-input">
    <input type="text" name="message" id="message" aria-label="message" placeholder="messsage goes here..."/>
    <button id="send">Send</button>
  </div>
</div>
`;

class RasaChat extends HTMLElement {
  constructor() {
    super();
    this.api = this.getAttribute("api");
    this.setAttribute("clientId", uuidv4());
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.querySelector(
      ".container"
    ).style.height = this.getAttribute("height");
    this.shadowRoot.querySelector(".container").style.width = this.getAttribute(
      "width"
    );
  }

  connectedCallback() {
    this.shadowRoot
      .querySelector("#send")
      .addEventListener("click", () => this.sendMessage());
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector("#send").removeEventListener();
  }

  get api() {
    return this.get_api;
  }
  set api(api) {
    this._api = api;
  }

  async sendMessage() {
    const message = this.shadowRoot.querySelector("#message").value;
    if (message.length > 2) {
      this.appendMessage(message);
      this.shadowRoot.querySelector("#message").value = "";
      axios
        .post(this.getAttribute("api"), {
          sender: this.getAttribute("clientId"),
          message
        })
        .then(res => {
          const { data } = res;
          console.log(data);
          let delay = 1000;
          data.forEach(response => {
            setTimeout(() => this.appendMessage(response.text, true), delay);
            delay = delay + 1000;
          });
        });
    }
  }

  appendMessage(message, bot = false) {
    const node = document.createElement("div");
    node.innerHTML = `<span>${message}</span>`;
    node.classList = node.classList + (bot == true ? "bot-msg" : "client-msg");

    this.shadowRoot.querySelector(".window").appendChild(node);

    this.shadowRoot
      .querySelector(".window div:last-of-type")
      .scrollIntoView({ behavior: "smooth" });
  }
}

window.customElements.define("rasa-chat", RasaChat);
