enum MethodOfEncryption {
    //% block="Caesar"
    Caesar,
    //% block="RSA"
    RSA,
}

namespace custom {
    let p = 23;
    let g = 5;
    const radioChannel = 100;
    let connected = true;
    let secrectKey: number;
    let listening = false;


    //% block
    export function WaitForHost() {
        radio.setGroup(radioChannel);
        let waiting = true;
        while (waiting) {
            basic.showString("W4H");
            radio.onReceivedString(function (receivedString: string) {
                if (receivedString == "Pair Please") {
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
            radio.sendValue("A", Math.pow(g, a) % p);
            //basic.showString("SN = " + Math.pow(g, a) % p);
            radio.onReceivedValue(function (name: string, value: number) {
                if (name == "B") {
                    secrectKey = (Math.pow(value, a) % p);
                    basic.showNumber(secrectKey);
                    connected = true;
                    ListenForMessage();
                }
            })
            //if youre not then...
        } else {
            //once you get a calulate B and send it back.
            let b = Math.floor(Math.random() * 25);
            radio.onReceivedValue(function (name: string, value: number) {
                if (name == "A") {
                    let B = (Math.pow(g, b) % p);
                    radio.sendValue("B", B);
                    secrectKey = (Math.pow(value, b) % p);
                    basic.showNumber(secrectKey);
                    connected = true;
                    ListenForMessage();
                }
            })
        }
    }

    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    //%block
    export function Encrypt(message: string, EncryptionType: MethodOfEncryption) {
        let encryptedMessage: string = "";
        switch (EncryptionType) {
            case MethodOfEncryption.Caesar:
                let shift = 10;
                for (let i = 0; i < message.length; i++) {
                    let index: number;
                    for (let x = 0; x < alphabet.length; x++) {
                        if (alphabet[x] == message.charAt(i)) {
                            index = x;
                            break;
                        }
                    }
                    let newValue = index + shift;
                    if (newValue > alphabet.length) {
                        newValue = (newValue - alphabet.length);
                    }
                    encryptedMessage = encryptedMessage + alphabet[newValue];
                }

            case MethodOfEncryption.RSA:
                break;
        }
        return encryptedMessage;
    }

    //%block
    export function decrypt(message: string, EncryptionType: MethodOfEncryption) {
        let decryptedMessage: string = "";
        switch (EncryptionType) {
            case MethodOfEncryption.Caesar:
                let shift = 10;
                for (let i = 0; i < message.length; i++) {
                    let index: number;
                    for (let x = 0; x < alphabet.length; x++) {
                        if (alphabet[x] == message.charAt(i)) {
                            index = x;
                            break;
                        }
                    }
                    let newValue = index - shift;
                    if (newValue < 0) {
                        newValue = (alphabet.length + newValue);
                    }
                    decryptedMessage = decryptedMessage + alphabet[newValue];
                }
                break;
            case MethodOfEncryption.RSA:
                break;
        }
        return decryptedMessage;
    }

    //%block
    export function SendEncryptedMessage(message: string, method: MethodOfEncryption) {
        let listening = false;
        switch (method) {
            case MethodOfEncryption.Caesar:
                radio.sendValue(Encrypt(message, MethodOfEncryption.Caesar), 101);
                let listening = true;
                break;
            case MethodOfEncryption.RSA:
                break;
        }
        //101 means ceasar.
    }
    //%block
    export function ListenForMessage() {
        basic.showString("LSN")
        radio.onReceivedValue(function (name: string, value: number) {
            basic.showString("RCD")
            if (value == 101) {
                basic.showString(decrypt(name, MethodOfEncryption.Caesar));
            } else {
                if (value == 102) {
                    basic.showString(decrypt(name, MethodOfEncryption.RSA));
                }
            }
            ListenForMessage();

        })
    }



}
