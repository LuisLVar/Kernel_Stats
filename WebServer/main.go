package main

import (
	"fmt"
	"log"
	"net/http"
	"github.com/gorilla/websocket"
	"io/ioutil"
	"time"
	"encoding/json"

)

var clients = make(map[*websocket.Conn]string)

type Message struct {
	data string `json:"data"`
}

var upgrader = websocket.Upgrader {
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
}


func homePage(w http.ResponseWriter, r *http.Request){
	fmt.Fprint(w, "Home Page")
}


func reader(conn *websocket.Conn){
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			delete(clients, conn)
			break
		}
		fmt.Println(string(p))
		clients[conn] = string(p);
		msg := []byte("Let's start to talk something.")
		err = conn.WriteMessage(messageType, msg)
		if err != nil {
			log.Println(err)
			return
		}
	}
}

func envioInfo(){
	for {
		for client := range clients {
			fmt.Println("Hay clientes")
			var value string = clients[client]
			fmt.Println(value)

			if value == "\"home\"" {
				data, err := ioutil.ReadFile("test.txt")
				if err != nil {
					fmt.Println("File reading error", err)
					return
				}
				fmt.Println("Contents of file:", string(data))
				errw := client.WriteJSON(string(data))
				if errw != nil {
					log.Printf("error: ", errw)
					client.Close()
					delete(clients, client)
				}	
			} else if value == "\"cpu\"" {
				data, err := ioutil.ReadFile("/proc/memo_201701023")
				if err != nil {
					fmt.Println("File reading error", err)
					return
				}
				fmt.Println("Contents of file:", string(data))

				mensaje := Message{data: string(data)}

				json, _ := json.Marshal( mensaje )

				errw := client.WriteJSON(json)
				if errw != nil {
					log.Printf("error: ", errw)
					client.Close()
					delete(clients, client)
				}	
			} else if value == "\"ram\"" {
				data, err := ioutil.ReadFile("/proc/memo_201701023")
				if err != nil {
					fmt.Println("File reading error", err)
					return
				}
				fmt.Println("Contents of file:", string(data))
				
				errw := client.WriteJSON(string(data))
				if errw != nil {
					log.Printf("error: ", errw)
					client.Close()
					delete(clients, client)
				}
			} 
		} 


		fmt.Println(len(clients))
		fmt.Println("------------")
		time.Sleep(2 * time.Second)
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request){
	upgrader.CheckOrigin = func(r *http.Request) bool {return true}
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil{
		log.Println(err)
	}
	defer ws.Close()
	log.Println("Client Successfully Connected...")
	reader(ws)	
}


func setupRoutes(){
	http.HandleFunc("/", homePage)
	http.HandleFunc("/ws", wsEndpoint)
}

func main(){
	fmt.Println("Go WebSockets")
	setupRoutes()
	go envioInfo()
	log.Fatal(http.ListenAndServe(":8080", nil))
}