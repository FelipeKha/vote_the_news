#!/usr/bin/expect

spawn ssh root@104.248.194.185
expect "Enter passphrase for key '/Users/felipekharaba/.ssh/id_rsa'" {
    send "vtncomingtolecreusot\r"
}
expect "Are you sure you want to continue connecting?" {
    send "yes\r"
}
interact
ls