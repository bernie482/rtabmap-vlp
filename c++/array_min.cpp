#include  <stdio.h>
#include  <stdlib.h>
#define  element 3
int min(int A[3]);
int main(void){
	int A[3] = {2,3,4};
	int min_value = 0;
	min_value = min(A);
	printf("%d" ,min_value);
	printf("\n");
	system("pause");
	return 0;
}
int min(int arr[3]){
	int min_val = arr[0];
	for(int i = 1; i < 3 ; i++){
		if(arr[i] < min_val){
			min_val = arr[i];
		}
	}
	return min_val;
}
