#include  <stdio.h>
#include  <stdlib.h>
#define ROW 4
#define COL 3
void search(int a[][COL], int b[]);
int main (void){
   int i, j , b[2];
   int a[ROW][COL] = {{26,  5,  7},
                      {10,  3, 47},
					  { 6, 76,  8},
					  {40,  4, 32}};
   
   
   printf ("�G���}�C��������\n");
   for(i = 0; i < ROW; i++)
   {
   	for(j = 0; j < COL; j++)
   	   printf("%02d ", a[i][j]);
   	 printf("\n");
   }
   search(a, b);
   printf("�}�C���̤j�� = %02d\n", b[0]);
   printf("�}�C���̤p�� = %02d\n", b[1]);
   system("pause");
   return 0;
}
void search(int arr[][COL], int p[])
{
	int i, j;
	*p = *(p + 1) = **arr;
	for(i = 0; i < ROW; i++){
		for(j = 0; j < COL; j++){
			if(*p < *(*(arr + i) + j))
			 *p = *(*(arr + i) + j);
			if(*(p + 1) > *(*(arr + i) + j))
			 *(p + 1) = *(*(arr + i) + j);
		}
	}
 } 
