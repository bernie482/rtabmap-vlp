#include <stdio.h>
#include <stdlib.h>
void count(int *);
int main (void){
	int num = 0;
	count (&num);
	printf ("%d" , num);
	printf ("\n");
	
	count (&num);
	printf ("%d" , num);
	printf ("\n");
	
	system ("pause");
	return 0;

}
void count (int *ptr){
	*ptr = *ptr + 1 ;
}
