#include <linux/sched.h>
#include <linux/sched/signal.h>
#include <linux/module.h>
#include <linux/seq_file.h>
#include <linux/proc_fs.h>
#include <linux/kernel_stat.h>
#include <linux/tick.h>

#ifdef arch_idle_time

static cputime64_t get_idle_time(int cpu)
{
	cputime64_t idle;
	idle = kcpustat_cpu(cpu).cpustat[CPUTIME_IDLE];
	if (cpu_online(cpu) && !nr_iowait_cpu(cpu))
		idle += arch_idle_time(cpu);
	return idle;
}
static cputime64_t get_iowait_time(int cpu)
{
	cputime64_t iowait;
	iowait = kcpustat_cpu(cpu).cpustat[CPUTIME_IOWAIT];
	if (cpu_online(cpu) && nr_iowait_cpu(cpu))
		iowait += arch_idle_time(cpu);
	return iowait;
}
#else

static u64 get_idle_time(int cpu)
{
	u64 idle, idle_time = -1ULL;
	if (cpu_online(cpu))
		idle_time = get_cpu_idle_time_us(cpu, NULL);
	if (idle_time == -1ULL)
		/* !NO_HZ or cpu offline so we can rely on cpustat.idle */
		idle = kcpustat_cpu(cpu).cpustat[CPUTIME_IDLE];
	else
		idle = nsecs_to_jiffies64(idle_time);

	return idle;
}

static u64 get_iowait_time(int cpu)
{
	u64 iowait, iowait_time = -1ULL;
	if (cpu_online(cpu))
		iowait_time = get_cpu_iowait_time_us(cpu, NULL);

	if (iowait_time == -1ULL)
		/* !NO_HZ or cpu offline so we can rely on cpustat.iowait */
		iowait = kcpustat_cpu(cpu).cpustat[CPUTIME_IOWAIT];
	else
		iowait = nsecs_to_jiffies64(iowait_time);

	return iowait;
}

#endif

static int my_proc_show(struct seq_file *m, void *v)
{
	int i;
	unsigned long jif;
	u64 user, nice, system, idle, iowait, irq, softirq, steal;
	u64 guest, guest_nice;
	u64 sum = 0;
	struct timespec boottime;

	user = nice = system = idle = iowait =
		irq = softirq = steal = 0;
	guest = guest_nice = 0;
	getboottime(&boottime);
	jif = boottime.tv_sec;
	seq_printf(m, "{");
	seq_printf(m, "\"procesos\":[\n");
	for_each_possible_cpu(i)
	{
		seq_printf(m, "{\n");
		seq_printf(m, "\"CPUTIME_USER\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_USER]);
		user += kcpustat_cpu(i).cpustat[CPUTIME_USER];

		seq_printf(m, ",\n\"CPUTIME_NICE\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_NICE]);
		nice += kcpustat_cpu(i).cpustat[CPUTIME_NICE];

		seq_printf(m, ",\n\"CPUTIME_SYSTEM\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_SYSTEM]);
		system += kcpustat_cpu(i).cpustat[CPUTIME_SYSTEM];

		seq_printf(m, ",\n\"idle_time\":");
		seq_put_decimal_ull(m, " ", get_idle_time(i));
		idle += get_idle_time(i);

		seq_printf(m, ",\n\"iowait_time\":");
		seq_put_decimal_ull(m, " ", get_iowait_time(i));
		iowait += get_iowait_time(i);

		seq_printf(m, ",\n\"CPUTIME_IRQ\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_IRQ]);
		irq += kcpustat_cpu(i).cpustat[CPUTIME_IRQ];

		seq_printf(m, ",\n\"CPUTIME_SOFTIRQ\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_SOFTIRQ]);
		softirq += kcpustat_cpu(i).cpustat[CPUTIME_SOFTIRQ];

		seq_printf(m, ",\n\"CPUTIME_STEAL\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_STEAL]);
		steal += kcpustat_cpu(i).cpustat[CPUTIME_STEAL];

		seq_printf(m, ",\n\"CPUTIME_GUEST\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_GUEST]);
		guest += kcpustat_cpu(i).cpustat[CPUTIME_GUEST];

		seq_printf(m, ",\n\"CPUTIME_GUEST_NICE\":");
		seq_put_decimal_ull(m, " ", kcpustat_cpu(i).cpustat[CPUTIME_GUEST_NICE]);
		guest_nice += kcpustat_cpu(i).cpustat[CPUTIME_GUEST_NICE];
		seq_printf(m, "\n},\n");
	}
	seq_printf(m, "],\n");
	//El total del cpu es la suma de todos los atributos
	sum += user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
	//crear el json, al ser de tipo u64, se debe utilizar cputime64_to_clock_t
	seq_printf(m, "\"cpu\":");
	seq_put_decimal_ull(m, " ", jiffies_64_to_clock_t(sum));
	seq_printf(m, ",\"used\":");
	seq_put_decimal_ull(m, " ", jiffies_64_to_clock_t((idle / sum) * 100));
	seq_printf(m, ",\"free\":");
	seq_put_decimal_ull(m, " ", jiffies_64_to_clock_t(sum - idle));
	seq_printf(m, ",\"average\":");
	seq_put_decimal_ull(m, " ", jiffies_64_to_clock_t(((sum - idle) * 100 / sum)));
	seq_printf(m, "}");
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
    entry = proc_create("cpu_201701023", 0777, NULL, &my_fops);
    if (!entry)
    {
        return -1;
    }
    else
    {
        printk(KERN_INFO "Luis Angel Vargas León\n");
    }
    return 0;
}

static void __exit test_exit(void)
{
    remove_proc_entry("cpu_201701023", NULL);
    printk(KERN_INFO "Diciembre 2020\n");
}

module_init(test_init);
module_exit(test_exit);
MODULE_LICENSE("GPL");