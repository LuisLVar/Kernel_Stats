package main

import (
	"fmt"
	"log"
	"net/http"
	"github.com/gorilla/websocket"
	"io/ioutil"
	"time"
	"github.com/shirou/gopsutil/cpu"
	ps "github.com/mitchellh/go-ps";
	"os/exec";
	"strconv";
	"container/list";
	"strings";
	"github.com/gorilla/mux"
	"encoding/json"
	"github.com/rs/cors"
	"os"

)

type Proceso struct {
	Ejecucion int `json:"Ejecucion"`
	Suspendidos int `json:"Suspendidos"`
	Detenidos int `json:"Detenidos"`
	Zombies int `json:"Zombies"`
	Idle int `json:"Idle"`
	Totales int `json:"Totales"`
	Procesos [][]string `json:"Procesos"`
}

type Mensaje struct {
	Data string `json:"data"`
}


// ------------------- KILL ----------------------------
func kill(w http.ResponseWriter, r *http.Request) {
	var respuesta Mensaje
    vars := mux.Vars(r)
    pid, err := strconv.Atoi(vars["id"])
	
	fmt.Println("kill "+ strconv.Itoa(pid))

	process, err := os.FindProcess(pid)

	if err != nil {
		fmt.Println("error1: " + err.Error());
	} else {
		err = process.Kill()
		if err != nil {
			fmt.Println("error3: " + err.Error())
		} else {
			fmt.Println("Proceso matado correctamente")
		}
	}

	
	fmt.Println("Command Successfully Executed")

	respuesta = Mensaje{ Data: "true" }

	json.NewEncoder(w).Encode(respuesta)
}


// ------------------- CPU  -----------------------------

func cpu_data(w http.ResponseWriter, r *http.Request){
	ejecucion := 0
    suspendidos := 0
    detenidos := 0
    zombies := 0
    idle := 0
    procesos := list.New()
	processList, err := ps.Processes()
	var processArray [][]string
    if err != nil {
        fmt.Println("ps.Processes() Failed")
        return
    }
	
    for x := range processList {
    	var proceso []string
        var process ps.Process
        process = processList[x]
		proceso = append(proceso, strconv.Itoa(process.Pid()))
		proceso = append(proceso, string(process.Executable()))
    	//--------------------------------------------------------------------------------------------
    	cmd := exec.Command("ps", "-p", strconv.FormatInt(int64(process.Pid()),10), "-o", "user=,%mem=,stat=")

		stdout, err := cmd.Output()
	
		if err != nil {
				fmt.Println(err.Error())
				return
			}
			extra := strings.Split(string(stdout), " ")
			for temp := len(extra) - 1; temp >= 0; temp -- {
			if extra[temp] != "" {
				proceso = append(proceso, extra[temp])
			}
		}
		proceso[2] = proceso[2][:1]
		if proceso[2] == "R" {
			ejecucion++
		} else if proceso[2] == "S" {
			suspendidos++
		} else if proceso[2] == "T" {
			detenidos++
		} else if proceso[2] == "Z" {
			zombies++
		} else {
			idle++
		}

		procesos.PushBack(proceso)
		processArray = append(processArray, proceso)
    }
    totales := procesos.Len()
	
    fmt.Println(totales)
    fmt.Println(ejecucion)
    fmt.Println(suspendidos)
    fmt.Println(detenidos)
    fmt.Println(zombies)
	fmt.Println(idle)
	
	salida := Proceso{ Ejecucion: ejecucion, Suspendidos:suspendidos, Detenidos: detenidos, Zombies: zombies, Idle: idle, Totales: totales, Procesos: processArray }
	w.Header().Set("Content-Type", "application/json")
	fmt.Println("Enpoint Get: Home");
	json.NewEncoder(w).Encode(salida)
}




// -------------------  Websocket  -----------------------

var clients = make(map[*websocket.Conn]string)

type Message struct {
	Data string `json:"data"`
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

				fmt.Println("Entra CPU");

				cpu, _ := cpu.Percent(0, true);
				fmt.Println(cpu);

				errw := client.WriteJSON(cpu)
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
			} else{
				fmt.Println("No entra")
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


func main(){
	fmt.Println("Go WebSockets")
	myRouter := mux.NewRouter().StrictSlash(true)

	myRouter.HandleFunc("/", homePage)
	myRouter.HandleFunc("/ws", wsEndpoint)
	myRouter.HandleFunc("/home", cpu_data)
	myRouter.HandleFunc("/kill/{id}", kill)

    c := cors.New(cors.Options{
        AllowedOrigins: []string{"*"},
        AllowCredentials: true,
    })

    handler := c.Handler(myRouter)


	go envioInfo()
	log.Fatal(http.ListenAndServe(":8080", handler))
}