obj-m += cpu_201701023.o
all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD)
modulesclean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean