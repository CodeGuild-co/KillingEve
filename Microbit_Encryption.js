namespace custom {
    let p = 23;
    let g = 5;
    const radioChannel = 100;

    //% block
    export function WaitForHost() 
    {
        radio.setGroup(radioChannel);
        let waiting = true;
        while (waiting) 
        {
            basic.showString("W4H");
            radio.onReceivedString(function (receivedString: string) 
            {
                if (receivedString == "Pair Please") 
                {
                    radio.sendString("Let's Connect");
                    waiting = false;
                    CalculateKeyNew("Client");
                }
            })
        }
    }

    //% block
    export function WaitForRecipent() {
        radio.setGroup(radioChannel);
        let pinging = true;
        //Keep broadcasting a signal untill a response has been made.
        while (pinging) {
            basic.showString("W4R");
            radio.sendString("Pair Please");
            basic.pause(100);
            radio.onReceivedString(function (receivedString: string) {
                if (receivedString == "Let's Connect") {
                    pinging = false;
                    CalculateKeyNew("Host");
                }
            })
        }
    }

    function CalculateKeyNew(type: string) {
        //if youre the host then...
        if (type == "Host") {
            let a = Math.ceil(Math.random() * 25);
            radio.sendNumber(Math.pow(g, a) % p);
            basic.showString("SN = " + Math.pow(g, a) % p);
            radio.onReceivedNumber(function (receivedNumber: number) {
                basic.showString("R:" + receivedNumber);
                const secrectKey = (Math.pow(receivedNumber, a) % p);
                basic.showNumber(secrectKey);
            })
            //if youre not then...
        } else {
            //once you get a calulate B and send it back.
            let b = Math.floor(Math.random() * 25);
            radio.onReceivedNumber(function (receivedNumber: number) {
                basic.showString("RN = " + receivedNumber);
                let B = (Math.pow(g, b) % p);
                radio.sendNumber(B);
                basic.showString("S:" + B);
                const secrectKey = (Math.pow(receivedNumber, b) % p);
                basic.showNumber(secrectKey);
            })
        }
    }


}
