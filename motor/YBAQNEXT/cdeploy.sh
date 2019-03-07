#!/bin/bash

cli="___cli___"
path="___path___"

if [ ! -d ./dAQNEXT/ ]
	then
		echo No existe la carpeta dAQNEXT, debe descomprimir el paquete
		return
fi

rm -rf $path/oAQNEXT
mv $path/AQNEXT $path/oAQNEXT
mv ./dAQNEXT $path/AQNEXT

cp $path/oAQNEXT/clientes/$cli/AQNEXT/local.py $path/AQNEXT/clientes/$cli/AQNEXT/local.py

chmod -R 775 $path/AQNEXT
chown -R www-data:www-data $path/AQNEXT
