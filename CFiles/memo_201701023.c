#include <linux/module.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/sched.h>
#include <linux/uaccess.h>
#include <linux/fs.h>
#include <linux/sysinfo.h>
#include <linux/seq_file.h>
#include <linux/slab.h>
#include <linux/mm.h>
#include <linux/swap.h>
#include <linux/kernel.h>
#include <linux/smp.h>
#include <linux/cpufreq.h>
#include <linux/cpumask.h>


static int my_proc_show(struct seq_file *m, void *v)
{
    struct sysinfo i;
    //struct cpufreq_policy *cp;
    unsigned long usedRam, totalRam; 

    si_meminfo(&i);
    usedRam = i.totalram - i.freeram;
    totalRam = i.totalram;

    seq_printf(m, "{'usedRam':%lu, 'totalRam':%lu}", usedRam, totalRam);

    return 0;
}

static ssize_t my_proc_write(struct file *file, const char __user *buffer, size_t count, loff_t *f_pos)
{
    return 0;
}

static int my_proc_open(struct inode *inode, struct file *file)
{
    return single_open(file, my_proc_show, NULL);
}

static struct file_operations my_fops = {
    .owner = THIS_MODULE,
    .open = my_proc_open,
    .release = single_release,
    .read = seq_read,
    .llseek = seq_lseek,
    .write = my_proc_write};

static int __init test_init(void)
{
    struct proc_dir_entry *entry;
    entry = proc_create("memo_201701023", 0777, NULL, &my_fops);
    if (!entry)
    {
        return -1;
    }
    else
    {
        printk(KERN_INFO "201701023\n");
    }
    return 0;
}

static void __exit test_exit(void)
{
    remove_proc_entry("memo_201701023", NULL);
    printk(KERN_INFO "Sistemas Operativos 1\n");
}

module_init(test_init);
module_exit(test_exit);
MODULE_LICENSE("GPL");