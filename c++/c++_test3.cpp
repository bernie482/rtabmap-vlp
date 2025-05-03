#include <iostream>
#include <cstdlib> 

using namespace std;
int main(void){
	int n, i = 1, sum = 0;
	do 
	{
		cout << "½Ð¿é¤Jn­È (n > 0): " << endl;
		cin >> n;
	}
	while (n <= 0);
	do 
	{
		sum += i++;
	}
	while (i <= n);
	cout << "1+2+3+...+"<< n << "=" << sum << endl;	
	system("pause");
	return 0 ;
}
