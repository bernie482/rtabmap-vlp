#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#define INC(x) x*=2; x+=1

using namespace std;


int main()
{                       
    int i, j;
    for (i = 0, j = 1; i < 5; i++)
        INC(j);
    printf("j = %d\n", j);
}

//�W�z�{���i�H���դU��{��
//for (i = 0, j = 1; i < 5; i++)
//    j *= 2;
//j += 1;  // ? �o�椣�b for �j�餺

                 