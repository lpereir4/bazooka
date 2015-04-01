package main

import (
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"log"
	mrand "math/rand"
	"os"
	"path"

	"github.com/bazooka-ci/bazooka/commons"
	"github.com/jawher/mow.cli"
)

const (
	// KEYFILE is the path to a file where the encryption key will be stored
	KEYFILE = ".bzkkey"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[mrand.Intn(len(letters))]
	}
	return string(b)
}

func generateKey(cmd *cli.Cmd) {
	pid := cmd.String(cli.StringArg{
		Name: "PROJECT_ID",
		Desc: "Project id",
	})

	cmd.Action = func() {
		key := randSeq(32)

		keyPath := path.Join(os.Getenv("HOME"), KEYFILE)
		err := ioutil.WriteFile(keyPath, []byte(key), 0600)
		if err != nil {
			log.Fatal(fmt.Errorf("Unable to write key to file ~/.bzkkey, reason is: %v\n", err))
		}

		client, err := NewClient(checkServerURI(*bzkUri))
		if err != nil {
			log.Fatal(err)
		}
		_, err = client.AddCryptoKey(*pid, keyPath)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("Key succesfully added")
	}
}

func encryptText(cmd *cli.Cmd) {
	toEncryptData := cmd.String(cli.StringArg{
		Name: "DATA",
		Desc: "Data to Encrypt",
	})

	cmd.Action = func() {
		keyPath := path.Join(os.Getenv("HOME"), KEYFILE)
		exists, err := bazooka.FileExists(keyPath)
		if err != nil {
			log.Fatal(err)
		}

		if !exists {
			log.Fatal("Key file does not exist on your local machine. You can either import it or generate a new one using `bzk generate-key`")
		}

		key, err := ioutil.ReadFile(keyPath)
		if err != nil {
			log.Fatal(err)
		}

		encrypted, err := bazooka.Encrypt(key, []byte(*toEncryptData))
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("Encrypted data: (to add to your .bazooka.yml file)")
		fmt.Printf("%0x\n", encrypted)

	}
}

func decryptText(cmd *cli.Cmd) {
	toDecryptData := cmd.String(cli.StringArg{
		Name: "DATA",
		Desc: "Data to Decrypt",
	})

	cmd.Action = func() {
		keyPath := path.Join(os.Getenv("HOME"), KEYFILE)
		exists, err := bazooka.FileExists(keyPath)
		if err != nil {
			log.Fatal(err)
		}

		if !exists {
			log.Fatal("Key file does not exist on your local machine. You can either import it or generate a new one using `bzk generate-key`")
		}

		key, err := ioutil.ReadFile(keyPath)
		if err != nil {
			log.Fatal(err)
		}
		toDecryptDataAsHex, err := hex.DecodeString(*toDecryptData)
		if err != nil {
			log.Fatal(fmt.Errorf("Unable to decode string as hexa data, reason is: %v\n", err))
		}

		decrypted, err := bazooka.Decrypt(key, toDecryptDataAsHex)
		if err != nil {
			log.Fatal(fmt.Errorf("Unable to Decrypt Data ~/.bzkkey, reason is: %v\n", err))
		}
		fmt.Println("Decrypted data: ")
		fmt.Printf("%s\n", decrypted)

	}
}
