#!/usr/bin/expect -f

set timeout 60

ssh-keyscan 104.248.194.185 >> ~/.ssh/known_hosts
spawn ssh root@104.248.194.185

expect "Enter passphrase for key '/Users/felipekharaba/.ssh/id_rsa'"
send -- "vtncomingtolecreusot\r"
# expect "Are you sure you want to continue connecting"
# send -- "yes\r"
expect "root@docker-s-1vcpu-1gb-ams3-01:~# "
send -- "date >> timestamp.txt\r"
expect "# "
send -- "docker ps -aq | xargs docker stop | xargs docker rm\r"
expect "# "
send -- "rm -rf vote_the_news\r"
expect "# "
send -- "git clone https://github.com/FelipeKha/vote_the_news.git\r"
expect "# "
send -- "cd vote_the_news\r"
expect "# "
send -- "docker-compose up -d\r"
expect "# "
send -- "exit\r"
expect eof


# spawn ssh root@104.248.194.185 'bash -s' < remote_script.sh
# spawn ssh -T root@104.248.194.185 << _remote_commands
# date >> timestamp.txt

# rm -rf vote_the_news
# mkdir vote_the_news
# cd vote_the_news
# git clone https://github.com/FelipeKha/vote_the_news.git

# _remote_commands